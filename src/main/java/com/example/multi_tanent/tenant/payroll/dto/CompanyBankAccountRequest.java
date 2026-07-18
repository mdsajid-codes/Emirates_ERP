package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;

@Data
public class CompanyBankAccountRequest {
    private Long id; // For updates
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String branchName;
    private Boolean isPrimary;
}
