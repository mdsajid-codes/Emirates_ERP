package com.example.multi_tanent.purchases.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseInvoiceRequest {
    private String billLedger;
    private Long supplierId;
    private String billNumber;
    private String orderNumber;

    @NotNull
    private LocalDate billDate;

    private LocalDate dueDate;
    private String billType;
    private Boolean grossNetEnabled;
    private String notes;

    // totals are computed server-side but client may provide otherCharges
    private BigDecimal otherCharges;

    // lines and attachments
    private List<PurPurchaseInvoiceItemRequest> lines;
    private List<PurPurchaseInvoiceAttachmentRequest> attachments;

    private String template;

    private String createdBy;
}
