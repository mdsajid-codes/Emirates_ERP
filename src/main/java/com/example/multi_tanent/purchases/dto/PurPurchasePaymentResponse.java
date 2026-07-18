package com.example.multi_tanent.purchases.dto;

// Response DTOs

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
public class PurPurchasePaymentResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private BigDecimal amount;
    private Boolean payFullAmount;
    private Boolean taxDeducted;
    private BigDecimal tdsAmount;
    private String tdsSection;
    private LocalDate paymentDate;
    private String paymentMode;
    private String paidThrough;
    private String reference;
    private String chequeNumber;
    private BigDecimal amountPaid;
    private BigDecimal amountUsedForPayments;
    private BigDecimal amountRefunded;
    private BigDecimal amountInExcess;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<PurPurchasePaymentAllocationResponse> allocations;
    private List<PurPurchasePaymentAttachmentResponse> attachments;
    private Long tenantId;
}
