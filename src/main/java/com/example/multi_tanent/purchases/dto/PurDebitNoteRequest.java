package com.example.multi_tanent.purchases.dto;

import com.example.multi_tanent.purchases.enums.DebitNoteStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurDebitNoteRequest {
    private Long locationId;
    private Long supplierId;
    private String billLedger;
    private String debitNoteNumber;
    private String billNumber;
    private LocalDate debitNoteDate;
    private LocalDate debitNoteDueDate;
    private BigDecimal amount;
    private BigDecimal taxPercentage;
    private String termsAndConditions;
    private String notes;
    private DebitNoteStatus status;
    private BigDecimal balanceDue;
    private List<String> attachments;
    private List<PurDebitNoteItemRequest> items;
    private String otherReferences;
    private String billOfLading;
    private String motorVehicleNo;
    private String createdBy;
    private String template;
    private String emailTo;
}
