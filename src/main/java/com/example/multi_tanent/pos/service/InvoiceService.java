package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.InvoiceDto;
import com.example.multi_tanent.pos.dto.InvoiceItemDto;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.SaleRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Store;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.tenant.payroll.repository.CompanyInfoRepository;
import com.example.multi_tanent.spersusers.enitity.CompanyInfo;
import com.example.multi_tanent.tenant.service.FileStorageService;
import org.springframework.core.io.Resource;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(value = "tenantTx", readOnly = true)
public class InvoiceService {

    private final SaleRepository saleRepository;
    private final InvoicePdfService invoicePdfService;
    private final CompanyInfoRepository companyInfoRepository;
    private final FileStorageService fileStorageService;

    public InvoiceService(SaleRepository saleRepository, InvoicePdfService invoicePdfService,
                          CompanyInfoRepository companyInfoRepository, FileStorageService fileStorageService) {
        this.saleRepository = saleRepository;
        this.invoicePdfService = invoicePdfService;
        this.companyInfoRepository = companyInfoRepository;
        this.fileStorageService = fileStorageService;
    }

    public Optional<InvoiceDto> generateInvoiceForSale(Long saleId) {
        return saleRepository.findWithDetailsById(saleId)
                .map(this::buildInvoiceDto);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Optional<byte[]> generateInvoicePdf(Long saleId) {
        return generateInvoiceForSale(saleId)
                .map(invoicePdfService::generateInvoicePdf);
    }

    private InvoiceDto buildInvoiceDto(Sale sale) {
        InvoiceDto.StoreInfo storeInfo = buildStoreInfo(sale.getStore());
        InvoiceDto.CustomerInfo customerInfo = buildCustomerInfo(sale.getCustomer());

        InvoiceDto.CompanyInfo companyInfo = null;
        if (sale.getTenant() != null) {
            CompanyInfo companyEntity = companyInfoRepository.findByTenantId(String.valueOf(sale.getTenant().getId())).orElse(null);
            if (companyEntity != null) {
                byte[] logoBytes = null;
                if (companyEntity.getLogoUrl() != null && !companyEntity.getLogoUrl().isEmpty()) {
                    try {
                        Resource resource = fileStorageService.loadFileAsResource(companyEntity.getLogoUrl(), true);
                        if (resource.exists()) {
                            logoBytes = resource.getContentAsByteArray();
                        }
                    } catch (Exception e) {
                        // Ignore logo load errors
                    }
                }
                companyInfo = InvoiceDto.CompanyInfo.builder()
                        .name(companyEntity.getCompanyName())
                        .address(companyEntity.getAddress())
                        .trn(companyEntity.getTrn())
                        .email(companyEntity.getEmail())
                        .phone(companyEntity.getPhone())
                        .logoBytes(logoBytes)
                        .build();
            }
        }

        long totalPaid = sale.getPayments().stream().mapToLong(Payment::getAmountCents).sum();

        String orderType = sale.getOrderType() != null ? sale.getOrderType().name().replace("_", " ") : "DINE IN";
        String cashierName = sale.getUser() != null && sale.getUser().getName() != null ? sale.getUser().getName() : "Admin";
        String paymentMethod = (sale.getPayments() != null && !sale.getPayments().isEmpty())
                ? sale.getPayments().stream()
                        .map(p -> p.getMethod() != null ? p.getMethod().toUpperCase() : "CASH")
                        .distinct()
                        .collect(Collectors.joining(", "))
                : "CASH";

        return InvoiceDto.builder()
                .saleId(sale.getId())
                .orderId(sale.getOrderId())
                .invoiceNo(sale.getInvoiceNo())
                .invoiceDate(sale.getInvoiceDate())
                .store(storeInfo)
                .company(companyInfo)
                .customer(customerInfo)
                .items(sale.getItems().stream().map(this::buildInvoiceItemDto).collect(Collectors.toList()))
                .subtotalCents(sale.getSubtotalCents())
                .taxCents(sale.getTaxCents())
                .discountCents(sale.getDiscountCents())
                .totalCents(sale.getTotalCents())
                .totalPaidCents(totalPaid)
                .amountDueCents(sale.getTotalCents() - totalPaid)
                .paymentStatus(sale.getPaymentStatus())
                .orderType(orderType)
                .cashierName(cashierName)
                .paymentMethod(paymentMethod)
                .build();
    }

    private InvoiceItemDto buildInvoiceItemDto(SaleItem saleItem) {
        CrmSalesProduct product = saleItem.getProduct();
        String productName = product != null ? product.getName() : "Item";

        return InvoiceItemDto.builder()
                .productName(productName)
                .variantInfo(product != null && product.getItemCode() != null ? product.getItemCode() : "")
                .uom(product != null && product.getUnitOfMeasure() != null ? product.getUnitOfMeasure() : "")
                .quantity(saleItem.getQuantity())
                .unitPriceCents(saleItem.getUnitPriceCents())
                .lineTotalCents(saleItem.getLineTotalCents())
                .taxCents(saleItem.getTaxCents())
                .build();
    }

    private InvoiceDto.StoreInfo buildStoreInfo(Store store) {
        if (store == null) {
            return null;
        }
        return InvoiceDto.StoreInfo.builder()
                .name(store.getName())
                .address(store.getAddress())
                .currency(store.getCurrency())
                .build();
    }

    private InvoiceDto.CustomerInfo buildCustomerInfo(BaseCustomer customer) {
        if (customer == null) {
            return null;
        }
        String name = customer.getCompanyName() != null && !customer.getCompanyName().isBlank()
                ? customer.getCompanyName() : customer.getPrimaryContactPersonFull();
        
        String address = customer.getBillingAddress() != null && customer.getBillingAddress().getAddressLine() != null
                ? customer.getBillingAddress().getAddressLine() : customer.getCity();

        return InvoiceDto.CustomerInfo.builder()
                .name(name != null ? name : "Customer")
                .email(customer.getContactEmail())
                .phone(customer.getContactPhone())
                .address(address)
                .trn(customer.getVatTrnNumber())
                .build();
    }
}