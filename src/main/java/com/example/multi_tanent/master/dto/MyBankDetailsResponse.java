package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.MyBankDetails;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyBankDetailsResponse {
    private Long id;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String branchName;
    private String swiftCode;
    private String iban;
    private boolean isPrimary;

    public static MyBankDetailsResponse fromEntity(MyBankDetails entity) {
        return MyBankDetailsResponse.builder()
                .id(entity.getId())
                .bankName(entity.getBankName())
                .accountNumber(entity.getAccountNumber())
                .ifscCode(entity.getIfscCode())
                .accountHolderName(entity.getAccountHolderName())
                .branchName(entity.getBranchName())
                .swiftCode(entity.getSwiftCode())
                .iban(entity.getIban())
                .isPrimary(entity.isPrimary())
                .build();
    }
}
