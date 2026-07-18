package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EmployeeLoanRequest {
    private String employeeCode;
    private Long loanProductId;
    private BigDecimal requestedAmount;
    private Integer installments;
}