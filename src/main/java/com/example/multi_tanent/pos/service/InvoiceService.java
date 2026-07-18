package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.InvoiceDto;
import com.example.multi_tanent.pos.dto.InvoiceItemDto;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.spersusers.enitity.Store;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service("posInvoiceService")
@Transactional("tenantTx")
public class InvoiceService {

    private final SaleService saleService;
    private final InvoicePdfService invoicePdfService;

    public InvoiceService(SaleService saleService, InvoicePdfService invoicePdfService) {
        this.saleService = saleService;
        this.invoicePdfService = invoicePdfService;
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceDto> generateInvoiceForSale(Long saleId) {
        return saleService.getSaleById(saleId).map(this::buildInvoiceDto);
    }

    @Transactional(readOnly = true)
    public Optional<byte[]> generateInvoicePdf(Long saleId) {
        return generateInvoiceForSale(saleId)
                .map(invoicePdfService::generateInvoicePdf);
    }

    private InvoiceDto buildInvoiceDto(Sale sale) {
        InvoiceDto.StoreInfo storeInfo = buildStoreInfo(sale.getStore());
        InvoiceDto.CustomerInfo customerInfo = buildCustomerInfo(sale.getCustomer());

        long totalPaid = sale.getPayments().stream().mapToLong(Payment::getAmountCents).sum();

        return InvoiceDto.builder()
                .saleId(sale.getId())
                .orderId(sale.getOrderId())
                .invoiceNo(sale.getInvoiceNo())
                .invoiceDate(sale.getInvoiceDate())
                .store(storeInfo)
                .customer(customerInfo)
                .items(sale.getItems().stream().map(this::buildInvoiceItemDto).collect(Collectors.toList()))
                .subtotalCents(sale.getSubtotalCents())
                .taxCents(sale.getTaxCents())
                .discountCents(sale.getDiscountCents())
                .totalCents(sale.getTotalCents())
                .totalPaidCents(totalPaid)
                .amountDueCents(sale.getTotalCents() - totalPaid)
                .paymentStatus(sale.getPaymentStatus())
                .build();
    }

    private InvoiceItemDto buildInvoiceItemDto(SaleItem saleItem) {
        ProductVariant variant = saleItem.getProductVariant();
        Product product = variant.getProduct();

        return InvoiceItemDto.builder()
                .productName(product.getName())
                .variantInfo(Optional.ofNullable(variant.getAttributes()).map(Object::toString).orElse(""))
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

    private InvoiceDto.CustomerInfo buildCustomerInfo(Customer customer) {
        if (customer == null) {
            return null;
        }
        return InvoiceDto.CustomerInfo.builder()
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .build();
    }
}