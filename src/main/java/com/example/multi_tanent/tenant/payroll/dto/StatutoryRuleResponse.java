package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.StatutoryRule;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class StatutoryRuleResponse {
    private Long id;
    private String ruleName;
    private String description;
    private BigDecimal employeeContributionRate;
    private BigDecimal employerContributionRate;
    private BigDecimal contributionCap;
    private String taxSlabsJson;
    private Boolean isActive;

    public static StatutoryRuleResponse fromEntity(StatutoryRule rule) {
        if (rule == null) return null;
        StatutoryRuleResponse dto = new StatutoryRuleResponse();
        dto.setId(rule.getId());
        dto.setRuleName(rule.getRuleName());
        dto.setDescription(rule.getDescription());
        dto.setEmployeeContributionRate(rule.getEmployeeContributionRate());
        dto.setEmployerContributionRate(rule.getEmployerContributionRate());
        dto.setContributionCap(rule.getContributionCap());
        dto.setTaxSlabsJson(rule.getTaxSlabsJson());
        dto.setIsActive(rule.getIsActive());
        return dto;
    }
}