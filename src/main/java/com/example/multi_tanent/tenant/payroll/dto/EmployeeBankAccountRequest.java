package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;

@Data
public class EmployeeBankAccountRequest {
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private Boolean isPrimary;
}