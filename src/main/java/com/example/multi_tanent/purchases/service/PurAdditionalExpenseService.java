package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.enums.ItemType;
import com.example.multi_tanent.production.repository.*;
import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.entity.*;
import com.example.multi_tanent.purchases.repository.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurAdditionalExpenseService {

    private final PurAdditionalExpenseRepository repository;
    private final TenantRepository tenantRepository;
    private final PartyRepository partyRepository;
    private final PurPurchaseOrderRepository poRepository;
    private final PurGrnRepository grnRepository;
    private final ProTaxRepository taxRepository;
    private final ProUnitRepository unitRepository;
    private final ProRawMaterialsRepository rawMaterialsRepository;
    private final ProFinishedGoodRepository finishedGoodRepository;
    private final ProSemiFinishedRepository semiFinishedRepository;
    private final PurPurchaseInvoiceRepository invoiceRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        // Robust lookup: try by tenantId first, fallback to first record in DB
        return tenantRepository.findByTenantId(tenantId)
                .or(() -> {
                    System.out.println("WARN: Tenant record not found for ID: " + tenantId + ". Falling back to first record.");
                    return tenantRepository.findFirstByOrderByIdAsc();
                })
                .orElseThrow(() -> new IllegalStateException("No tenant record found in database."));
    }

    public PurAdditionalExpenseResponse create(PurAdditionalExpenseRequest request) {
        Tenant tenant = getCurrentTenant();
        PurAdditionalExpense ae = new PurAdditionalExpense();
        mapRequestToEntity(request, ae, tenant);
        
        // Generate number if not provided
        if (ae.getNumber() == null || ae.getNumber().isBlank()) {
            ae.setNumber("AE-" + System.currentTimeMillis());
        }

        PurAdditionalExpense saved = repository.save(ae);
        return mapEntityToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PurAdditionalExpenseResponse> getAll(Pageable pageable) {
        Long tenantId = getCurrentTenant().getId();
        return repository.findByTenantId(tenantId, pageable)
                .map(this::mapEntityToResponse);
    }

    @Transactional(readOnly = true)
    public PurAdditionalExpenseResponse getById(Long id) {
        Long tenantId = getCurrentTenant().getId();
        return repository.findByTenantIdAndId(tenantId, id)
                .map(this::mapEntityToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Additional Expense not found with id: " + id));
    }

    public PurAdditionalExpenseResponse update(Long id, PurAdditionalExpenseRequest request) {
        Tenant tenant = getCurrentTenant();
        PurAdditionalExpense ae = repository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Additional Expense not found with id: " + id));

        ae.getExpenseLines().clear();
        ae.getInventoryItems().clear();
        mapRequestToEntity(request, ae, tenant);

        PurAdditionalExpense saved = repository.save(ae);
        return mapEntityToResponse(saved);
    }

    public void delete(Long id) {
        Long tenantId = getCurrentTenant().getId();
        PurAdditionalExpense ae = repository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new EntityNotFoundException("Additional Expense not found with id: " + id));
        repository.delete(ae);
    }

    @Transactional(readOnly = true)
    public List<PurAdditionalExpenseProduct> getServiceRelatedProducts() {
        Long tenantId = getCurrentTenant().getId();
        List<PurAdditionalExpenseProduct> results = new ArrayList<>();

        // Raw Materials
        rawMaterialsRepository.findByTenantId(tenantId).stream()
                .filter(p -> p.getItemType() == ItemType.SERVICE)
                .forEach(p -> results.add(PurAdditionalExpenseProduct.builder()
                        .id(p.getId()).name(p.getName()).itemCode(p.getItemCode()).itemType(p.getItemType()).category("RM").build()));

        // Semi Finished Goods
        semiFinishedRepository.findByTenantId(tenantId).stream()
                .filter(p -> p.getItemType() == ItemType.SERVICE)
                .forEach(p -> results.add(PurAdditionalExpenseProduct.builder()
                        .id(p.getId()).name(p.getName()).itemCode(p.getItemCode()).itemType(p.getItemType()).category("SFG").build()));

        // Finished Goods
        finishedGoodRepository.findByTenantId(tenantId).stream()
                .filter(p -> p.getItemType() == ItemType.SERVICE)
                .forEach(p -> results.add(PurAdditionalExpenseProduct.builder()
                        .id(p.getId()).name(p.getName()).itemCode(p.getItemCode()).itemType(p.getItemType()).category("FG").build()));

        return results;
    }

    @Transactional(readOnly = true)
    public List<PurPurchaseInvoice> getPurchaseInvoices() {
        Long tenantId = getCurrentTenant().getId();
        return invoiceRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<PurGrn> getGrns() {
        Long tenantId = getCurrentTenant().getId();
        return grnRepository.findByTenantId(tenantId);
    }

    private void mapRequestToEntity(PurAdditionalExpenseRequest request, PurAdditionalExpense entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setNumber(request.getNumber());
        entity.setDate(request.getDate());
        entity.setContract(request.getContract());
        entity.setTransactionType(request.getTransactionType());
        entity.setCurrency(request.getCurrency());
        entity.setExchangeRate(request.getExchangeRate());
        entity.setComment(request.getComment());
        entity.setStatus(request.getStatus());

        if (request.getSupplierId() != null) {
            entity.setSupplier(partyRepository.findById(request.getSupplierId()).orElse(null));
        }

        if (request.getPurchaseOrderId() != null) {
            entity.setPurchaseOrder(poRepository.findById(request.getPurchaseOrderId()).orElse(null));
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.getExpenseLines() != null) {
            for (PurAdditionalExpenseLineRequest lineReq : request.getExpenseLines()) {
                PurAdditionalExpenseLine line = new PurAdditionalExpenseLine();
                line.setAmount(lineReq.getAmount());
                line.setTaxAmount(lineReq.getTaxAmount());
                line.setTotalAmount(lineReq.getTotalAmount());
                if (lineReq.getProductId() != null) {
                    line.setProductId(lineReq.getProductId());
                }
                if (lineReq.getTaxId() != null) {
                    line.setTax(taxRepository.findById(lineReq.getTaxId()).orElse(null));
                }
                entity.addExpenseLine(line);
                totalAmount = totalAmount.add(line.getTotalAmount());
            }
        }

        if (request.getInventoryItems() != null) {
            for (PurAdditionalExpenseInventoryRequest invReq : request.getInventoryItems()) {
                PurAdditionalExpenseInventory item = new PurAdditionalExpenseInventory();
                item.setDocumentType(invReq.getDocumentType());
                item.setDocumentId(invReq.getDocumentId());
                item.setProductId(invReq.getProductId());
                item.setBatch(invReq.getBatch());
                item.setQuantity(invReq.getQuantity());
                item.setPrice(invReq.getPrice());
                item.setAmount(invReq.getAmount());
                item.setFactor(invReq.getFactor());
                item.setExpenseAmount(invReq.getExpenseAmount());
                if (invReq.getUnitId() != null) {
                    item.setUnit(unitRepository.findById(invReq.getUnitId()).orElse(null));
                }
                entity.addInventoryItem(item);
            }
        }
        
        entity.setTotalAmount(totalAmount);
    }

    private PurAdditionalExpenseResponse mapEntityToResponse(PurAdditionalExpense entity) {
        List<PurAdditionalExpenseLineResponse> lines = entity.getExpenseLines().stream().map(l -> {
            String prodName = "N/A";
            String itemCode = "";
            String category = "";
            
            if (l.getProductId() != null) {
                var rm = rawMaterialsRepository.findById(l.getProductId());
                if (rm.isPresent()) {
                    prodName = rm.get().getName();
                    itemCode = rm.get().getItemCode();
                    category = "RM";
                } else {
                    var sf = semiFinishedRepository.findById(l.getProductId());
                    if (sf.isPresent()) {
                        prodName = sf.get().getName();
                        itemCode = sf.get().getItemCode();
                        category = "SFG";
                    } else {
                        var fg = finishedGoodRepository.findById(l.getProductId());
                        if (fg.isPresent()) {
                            prodName = fg.get().getName();
                            itemCode = fg.get().getItemCode();
                            category = "FG";
                        }
                    }
                }
            }

            return PurAdditionalExpenseLineResponse.builder()
                .id(l.getId())
                .productId(l.getProductId())
                .productName(prodName)
                .itemCode(itemCode)
                .category(category)
                .amount(l.getAmount())
                .taxId(l.getTax() != null ? l.getTax().getId() : null)
                .taxCode(l.getTax() != null ? l.getTax().getCode() : null)
                .taxAmount(l.getTaxAmount())
                .totalAmount(l.getTotalAmount())
                .build();
        }).collect(Collectors.toList());

        List<PurAdditionalExpenseInventoryResponse> items = entity.getInventoryItems().stream().map(i -> {
            String prodName = "";
            String itemCode = "";
            // Polymorphic lookup
            var rm = rawMaterialsRepository.findById(i.getProductId());
            if (rm.isPresent()) {
                prodName = rm.get().getName();
                itemCode = rm.get().getItemCode();
            } else {
                var fg = finishedGoodRepository.findById(i.getProductId());
                if (fg.isPresent()) {
                    prodName = fg.get().getName();
                    itemCode = fg.get().getItemCode();
                }
            }

            return PurAdditionalExpenseInventoryResponse.builder()
                .id(i.getId())
                .documentType(i.getDocumentType())
                .documentId(i.getDocumentId())
                .productId(i.getProductId())
                .productName(prodName)
                .itemCode(itemCode)
                .batch(i.getBatch())
                .quantity(i.getQuantity())
                .unitId(i.getUnit() != null ? i.getUnit().getId() : null)
                .unitName(i.getUnit() != null ? i.getUnit().getName() : null)
                .price(i.getPrice())
                .amount(i.getAmount())
                .factor(i.getFactor())
                .expenseAmount(i.getExpenseAmount())
                .build();
        }).collect(Collectors.toList());

        return PurAdditionalExpenseResponse.builder()
            .id(entity.getId())
            .number(entity.getNumber())
            .date(entity.getDate())
            .supplierId(entity.getSupplier() != null ? entity.getSupplier().getId() : null)
            .supplierName(entity.getSupplier() != null ? entity.getSupplier().getCompanyName() : null)
            .contract(entity.getContract())
            .transactionType(entity.getTransactionType())
            .purchaseOrderId(entity.getPurchaseOrder() != null ? entity.getPurchaseOrder().getId() : null)
            .poNumber(entity.getPurchaseOrder() != null ? entity.getPurchaseOrder().getPoNumber() : null)
            .currency(entity.getCurrency())
            .exchangeRate(entity.getExchangeRate())
            .comment(entity.getComment())
            .status(entity.getStatus())
            .totalAmount(entity.getTotalAmount())
            .expenseLines(lines)
            .inventoryItems(items)
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
