package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class SalaryStructureRequest {
    private String employeeCode;
    private String structureName;
    private LocalDate effectiveDate;
    private List<ComponentRequest> components;

    @Data
    public static class ComponentRequest {
        private String componentCode;
        private BigDecimal value;
        private String formula;
    }
}