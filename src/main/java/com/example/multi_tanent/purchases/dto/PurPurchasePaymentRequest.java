package com.example.multi_tanent.purchases.dto;

// package com.example.multi_tanent.purchases.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchasePaymentRequest {
    private Long supplierId;

    @NotNull
    @DecimalMin("0.000001")
    private BigDecimal amount;

    private Boolean payFullAmount;
    private Boolean taxDeducted;
    private BigDecimal tdsAmount;
    private String tdsSection;

    @NotNull
    private LocalDate paymentDate;

    private String paymentMode;
    private String paidThrough;
    private String reference;
    private String chequeNumber;

    private String notes;
    private String createdBy;

    // Allocations and attachments sent with request
    private List<PurPurchasePaymentAllocationRequest> allocations;
    private List<PurPurchasePaymentAttachmentRequest> attachments;
}
