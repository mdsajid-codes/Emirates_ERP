package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.SaleDto;
import com.example.multi_tanent.pos.dto.SaleRequest;
import com.example.multi_tanent.pos.dto.SaleItemDto;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.CrmSalesProductRepository;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.StoreRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.pos.repository.*;
import com.example.multi_tanent.config.TenantContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional("tenantTx")
public class SaleService {

    private static final Logger logger = LoggerFactory.getLogger(SaleService.class);

    private final SaleRepository saleRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PartyRepository partyRepository;
    private final CrmSalesProductRepository crmSalesProductRepository;
    private final InventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final StockMovementService stockMovementService;
    private final PosAccountingIntegrationService posAccountingIntegrationService;

    public SaleService(SaleRepository saleRepository, TenantRepository tenantRepository,
            UserRepository userRepository, PartyRepository partyRepository,
            CrmSalesProductRepository crmSalesProductRepository,
            InventoryRepository inventoryRepository, StoreRepository storeRepository,
            StockMovementService stockMovementService,
            PosAccountingIntegrationService posAccountingIntegrationService) {
        this.saleRepository = saleRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.partyRepository = partyRepository;
        this.crmSalesProductRepository = crmSalesProductRepository;
        this.inventoryRepository = inventoryRepository;
        this.storeRepository = storeRepository;
        this.stockMovementService = stockMovementService;
        this.posAccountingIntegrationService = posAccountingIntegrationService;
    }

    private Tenant getCurrentTenant() {
        String tenantIdStr = TenantContext.getTenantId();
        if (tenantIdStr == null || tenantIdStr.isEmpty()) {
            throw new IllegalStateException("Tenant context is not set.");
        }
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new RuntimeException("Tenant not found with identifier: " + tenantIdStr));
    }

    @Transactional
    public SaleDto createSale(SaleRequest request) {
        Tenant currentTenant = getCurrentTenant();

        Sale sale = new Sale();
        sale.setTenant(currentTenant);
        sale.setInvoiceNo(generateInvoiceNumber());
        sale.setInvoiceDate(OffsetDateTime.now());
        sale.setStatus("completed");
        sale.setPaymentStatus("paid");
        sale.setOrderId(request.getOrderId() != null ? request.getOrderId()
                : "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        if (request.getOrderType() != null) {
            sale.setOrderType(request.getOrderType());
        } else {
            sale.setOrderType(com.example.multi_tanent.pos.enums.OrderType.DINE_IN);
        }
        sale.setAdultsCount(request.getAdultsCount());
        sale.setKidsCount(request.getKidsCount());
        sale.setSalesSource(request.getSalesSource());
        sale.setDeliveryCharge(request.getDeliveryCharge() != null ? request.getDeliveryCharge() : 0L);

        if (request.getCustomerId() != null) {
            BaseCustomer customer = partyRepository.findById(request.getCustomerId()).orElse(null);
            sale.setCustomer(customer);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = username != null ? userRepository.findByEmail(username).orElse(null) : null;
        sale.setUser(currentUser);

        Store saleStore = null;
        if (request.getStoreId() != null) {
            saleStore = storeRepository.findByIdAndTenantId(request.getStoreId(), currentTenant.getId()).orElse(null);
        }
        if (saleStore == null) {
            List<Store> tenantStores = storeRepository.findByTenantId(currentTenant.getId());
            if (!tenantStores.isEmpty()) {
                saleStore = tenantStores.get(0);
            }
        }
        sale.setStore(saleStore);

        long subtotal = 0L;
        long totalTax = 0L;

        final Store finalStore = saleStore;
        for (var itemRequest : request.getItems()) {
            if (finalStore != null) {
                inventoryRepository.findByStoreIdAndProductId(finalStore.getId(), itemRequest.getProductId())
                        .ifPresent(inventory -> {
                            if (inventory.getQuantity() < itemRequest.getQuantity()) {
                                logger.warn("Low stock for product {}: Requested {}, but only {} available.",
                                        inventory.getProduct().getName(), itemRequest.getQuantity(), inventory.getQuantity());
                            }
                        });
            }
        }

        List<SaleItem> saleItems = request.getItems().stream().map(itemRequest -> {
            CrmSalesProduct product = crmSalesProductRepository.findByIdAndTenantId(itemRequest.getProductId(), currentTenant.getId())
                    .orElseThrow(() -> new RuntimeException("Master product not found with id: " + itemRequest.getProductId()));

            long unitPriceCents = product.getSalesPrice() != null
                    ? product.getSalesPrice().multiply(java.math.BigDecimal.valueOf(100)).longValue()
                    : 0L;
            long costCents = product.getPurchasePrice() != null
                    ? product.getPurchasePrice().multiply(java.math.BigDecimal.valueOf(100)).longValue()
                    : 0L;

            long lineTotal = unitPriceCents * itemRequest.getQuantity();
            long lineTax = 0L;
            if (product.getTaxRate() != null) {
                lineTax = (long) ((lineTotal * product.getTaxRate()) / 100);
            }

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(product);
            saleItem.setCostCents(costCents);
            saleItem.setQuantity(itemRequest.getQuantity());
            saleItem.setUnitPriceCents(unitPriceCents);
            saleItem.setLineTotalCents(lineTotal);
            saleItem.setTaxCents(lineTax);
            saleItem.setDiscountCents(0L);
            return saleItem;
        }).collect(Collectors.toList());

        for (SaleItem item : saleItems) {
            subtotal += item.getLineTotalCents();
            totalTax += item.getTaxCents();
        }

        sale.setItems(saleItems);
        sale.setSubtotalCents(subtotal);
        sale.setTaxCents(totalTax);
        sale.setDiscountCents(request.getDiscountCents() != null ? request.getDiscountCents() : 0L);
        sale.setTotalCents(subtotal + totalTax - sale.getDiscountCents());

        long totalPaid = 0L;
        if (request.getPayments() != null && !request.getPayments().isEmpty()) {
            List<Payment> payments = request.getPayments().stream().map(paymentRequest -> {
                Payment payment = new Payment();
                payment.setSale(sale);
                payment.setMethod(paymentRequest.getMethod());
                payment.setAmountCents(paymentRequest.getAmountCents());
                payment.setReference(paymentRequest.getReference());
                return payment;
            }).collect(Collectors.toList());
            sale.setPayments(payments);
            totalPaid = payments.stream().mapToLong(Payment::getAmountCents).sum();
        }

        if (totalPaid >= sale.getTotalCents()) {
            sale.setPaymentStatus("paid");
        } else if (totalPaid > 0) {
            sale.setPaymentStatus("partial");
        } else {
            sale.setPaymentStatus("unpaid");
        }

        final Sale savedSale = saleRepository.save(sale);

        savedSale.getItems().forEach(item -> {
            stockMovementService.createMovementForSale(
                    savedSale,
                    item.getProduct(),
                    -item.getQuantity()
            );
        });

        try {
            Long tenantId = savedSale.getTenant() != null ? savedSale.getTenant().getId() : null;
            if (tenantId != null) {
                Long jeId = posAccountingIntegrationService.postSaleToLedger(savedSale, tenantId);
                Long cogsJeId = posAccountingIntegrationService.postCogsToLedger(savedSale, tenantId);
                if (jeId != null || cogsJeId != null) {
                    savedSale.setJournalEntryId(jeId);
                    savedSale.setCogsJournalEntryId(cogsJeId);
                    saleRepository.save(savedSale);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to post POS sale {} to accounting ledger: {}", savedSale.getId(), e.getMessage(), e);
        }

        return toDto(savedSale);
    }

    @Transactional(readOnly = true)
    public List<SaleDto> getAllSalesForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return saleRepository.findByTenantId(currentTenant.getId()).stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Sale> getSaleById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return saleRepository.findByIdAndTenantId(id, currentTenant.getId());
    }

    @Transactional(readOnly = true)
    public Optional<SaleDto> getSaleDtoById(Long id) {
        return getSaleById(id).map(this::toDto);
    }

    public void deleteSale(Long id) {
        Sale sale = getSaleById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + id));

        if (sale.getTenant() != null) {
            posAccountingIntegrationService.reverseSaleFromLedger(sale, sale.getTenant().getId());
        }

        if (sale.getStockMovements() != null) {
            sale.getStockMovements().forEach(movement -> movement.setRelatedSale(null));
        }

        sale.getItems().forEach(item -> {
            StockMovement reversalMovement = StockMovement.builder()
                    .tenant(sale.getTenant())
                    .store(sale.getStore())
                    .product(item.getProduct())
                    .changeQuantity(item.getQuantity())
                    .reason("Sale Deletion (Reversal for INV-" + sale.getInvoiceNo() + ")")
                    .build();

            stockMovementService.createAndApplyStockMovement(reversalMovement);
        });

        saleRepository.delete(sale);
    }

    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private SaleDto toDto(Sale sale) {
        SaleDto dto = new SaleDto();
        dto.setId(sale.getId());
        dto.setInvoiceNo(sale.getInvoiceNo());
        dto.setInvoiceDate(sale.getInvoiceDate());
        dto.setStatus(sale.getStatus());
        dto.setPaymentStatus(sale.getPaymentStatus());
        dto.setOrderId(sale.getOrderId());

        if (sale.getCustomer() != null) {
            dto.setCustomerId(sale.getCustomer().getId());
            String cName = sale.getCustomer().getCompanyName() != null && !sale.getCustomer().getCompanyName().isBlank()
                    ? sale.getCustomer().getCompanyName() : sale.getCustomer().getPrimaryContactPersonFull();
            dto.setCustomerName(cName);
        }
        if (sale.getStore() != null) {
            dto.setStoreId(sale.getStore().getId());
            dto.setStoreName(sale.getStore().getName());
        }

        dto.setSubtotalCents(sale.getSubtotalCents());
        dto.setTaxCents(sale.getTaxCents());
        dto.setDiscountCents(sale.getDiscountCents());
        dto.setDeliveryCharge(sale.getDeliveryCharge());
        dto.setTotalCents(sale.getTotalCents());

        dto.setOrderType(sale.getOrderType() != null ? sale.getOrderType().name() : null);
        dto.setAdultsCount(sale.getAdultsCount());
        dto.setKidsCount(sale.getKidsCount());
        dto.setSalesSource(sale.getSalesSource());

        dto.setItems(sale.getItems().stream().map(this::toSaleItemDto).collect(Collectors.toList()));
        return dto;
    }

    private SaleItemDto toSaleItemDto(SaleItem saleItem) {
        SaleItemDto dto = new SaleItemDto();
        dto.setId(saleItem.getId());
        if (saleItem.getProduct() != null) {
            dto.setProductId(saleItem.getProduct().getId());
            dto.setProductName(saleItem.getProduct().getName());
        }
        dto.setQuantity(saleItem.getQuantity());
        dto.setUnitPriceCents(saleItem.getUnitPriceCents());
        dto.setLineTotalCents(saleItem.getLineTotalCents());
        dto.setTaxCents(saleItem.getTaxCents());
        dto.setDiscountCents(saleItem.getDiscountCents());
        return dto;
    }
}