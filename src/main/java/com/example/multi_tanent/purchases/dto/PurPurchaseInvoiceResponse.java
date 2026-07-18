package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseInvoiceResponse {
    private Long id;

    private String billLedger;
    private Long supplierId;
    private String supplierName;
    private String billNumber;
    private String orderNumber;
    private LocalDate billDate;
    private LocalDate dueDate;
    private String billType;
    private Boolean grossNetEnabled;
    private String notes;

    private BigDecimal subTotal;
    private BigDecimal totalDiscount;
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal;
    private BigDecimal paidAmount;
    private BigDecimal balance;

    private String template;

    private List<PurPurchaseInvoiceItemResponse> lines;
    private List<PurPurchaseInvoiceAttachmentResponse> attachments;

    private String createdBy;
    private LocalDateTime createdAt;
    private Long tenantId;
}
