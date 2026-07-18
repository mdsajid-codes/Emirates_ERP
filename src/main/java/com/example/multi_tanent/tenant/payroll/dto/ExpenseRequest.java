package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    private String employeeCode;
    private LocalDate expenseDate;
    private String category;
    private BigDecimal amount;
    private String description;
    private String billNumber;
    private String merchentName;
}