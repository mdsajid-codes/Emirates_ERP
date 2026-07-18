package com.example.multi_tanent.spersusers.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BaseBankDetailsRequest {
    private Long partyId;

    @NotBlank(message = "Bank name is required.")
    private String bankName;
    private String accountNumber;
    private String ifsCode;
    private String ibanCode;
    private String corporateId;
    private String locationBranch;
    private String branchAddress;
    private String beneficiaryMailId;
}