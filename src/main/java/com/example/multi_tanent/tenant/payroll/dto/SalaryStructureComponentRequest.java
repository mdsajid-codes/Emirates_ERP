package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SalaryStructureComponentRequest {
    private String componentCode; // e.g., "BASIC", "HRA"
    private BigDecimal value; // Can be a fixed amount or a percentage value based on component's calculation type
    private String formula; // Optional override for formula-based components
}