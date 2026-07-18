package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrmKpiEmployeeRequest {
    @NotNull(message = "Employee ID is required.")
    private Long employeeId;
    private BigDecimal targetValue;
}