package com.example.multi_tanent.pos.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceDto {
    private Long saleId;
    private String orderId;
    private String invoiceNo;
    private OffsetDateTime invoiceDate;

    private StoreInfo store;
    private CustomerInfo customer;

    private List<InvoiceItemDto> items;

    private Long subtotalCents;
    private Long taxCents;
    private Long discountCents;
    private Long totalCents;
    private Long totalPaidCents;
    private Long amountDueCents;

    private String paymentStatus;

    @Data
    @Builder
    public static class StoreInfo {
        private String name;
        private String address;
        private String currency;
    }

    @Data
    @Builder
    public static class CustomerInfo {
        private String name;
        private String email;
        private String phone;
    }
}