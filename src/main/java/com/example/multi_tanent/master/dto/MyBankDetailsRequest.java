package com.example.multi_tanent.master.dto;

import lombok.Data;

@Data
public class MyBankDetailsRequest {
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String branchName;
    private String swiftCode;
    private String iban;
    private boolean isPrimary;
}
