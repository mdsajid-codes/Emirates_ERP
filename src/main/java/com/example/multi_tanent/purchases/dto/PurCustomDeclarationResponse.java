package com.example.multi_tanent.purchases.dto;

import com.example.multi_tanent.purchases.enums.TaxIsDue;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurCustomDeclarationResponse {
    private Long id;
    private String declarationNumber;
    private Boolean isThirdPartyClearance;
    private String companyName;
    private TaxIsDue taxIsDue;
    private BigDecimal serviceCharge;
    private Boolean isApplyCustomPenalty;
    private BigDecimal customPenaltyAmount;
    private Long expenseAccountId;
    private String expenseAccountName;
    private Long departmentId;
    private String departmentName;
    private Long expenseItemId;
    private String expenseItemDescription;
    private String businessActivity;
    private String entityName;
    private Long responsiblePersonId;
    private String responsiblePersonName;
    private Boolean isGroupByHSCode;
    private Boolean isIncludeServiceCharge;
    private String status;
    private BigDecimal cifForeignValueTotal;
    private BigDecimal cifNationalValueTotal;
    private BigDecimal vatReverseChargeTotal;
    private BigDecimal totalDue;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<PurCustomDeclarationLineResponse> lines;
}
