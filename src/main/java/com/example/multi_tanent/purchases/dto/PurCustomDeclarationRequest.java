package com.example.multi_tanent.purchases.dto;

import com.example.multi_tanent.purchases.enums.TaxIsDue;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurCustomDeclarationRequest {
    private String declarationNumber;
    private Boolean isThirdPartyClearance;
    private String companyName;
    private TaxIsDue taxIsDue;
    private BigDecimal serviceCharge;
    private Boolean isApplyCustomPenalty;
    private BigDecimal customPenaltyAmount;
    private Long expenseAccountId;
    private Long departmentId;
    private Long expenseItemId;
    private String businessActivity;
    private String entityName;
    private Long responsiblePersonId;
    private Boolean isGroupByHSCode;
    private Boolean isIncludeServiceCharge;
    private String status;
    private List<PurCustomDeclarationLineRequest> lines;
}
