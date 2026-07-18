package com.example.multi_tanent.purchases.dto;

// package com.example.multi_tanent.purchase.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseOrderRequest {

    private String orderCategory;

    private Long supplierId;

    private String poNumber;
    private String reference;

    private Long locationId;
    private String projectNumber;
    private String deliverToType;
    private Long deliverToId;
    private String deliverToAddress;
    private String template;
    private String emailTo;

    private String termsAndConditions;
    private String notes;

    @NotNull
    private LocalDate date;

    private String discountMode;
    private String currency;
    private String remark;
    private String status;

    private String createdBy;

    // lists
    private List<PurPurchaseOrderItemRequest> items;
    private List<PurPurchaseOrderAttachmentRequest> attachments;
}
