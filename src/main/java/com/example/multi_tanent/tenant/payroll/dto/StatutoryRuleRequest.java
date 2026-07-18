package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StatutoryRuleRequest {
    private String ruleName;
    private String description;
    private BigDecimal employeeContributionRate;
    private BigDecimal employerContributionRate;
    private BigDecimal contributionCap;
    private String taxSlabsJson;
    private Boolean isActive;
}