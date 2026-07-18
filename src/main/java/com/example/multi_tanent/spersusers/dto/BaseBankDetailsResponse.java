package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.enitity.BaseBankDetails;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BaseBankDetailsResponse {
    private Long id;
    private Long partyId;
    private String bankName;
    private String accountNumber;
    private String ifsCode;
    private String ibanCode;
    private String corporateId;
    private String locationBranch;
    private String branchAddress;
    private String beneficiaryMailId;

    public static BaseBankDetailsResponse fromEntity(BaseBankDetails entity) {
        return BaseBankDetailsResponse.builder()
                .id(entity.getId())
                .partyId(entity.getParty() != null ? entity.getParty().getId() : null)
                .bankName(entity.getBankName())
                .accountNumber(entity.getAccountNumber())
                .ifsCode(entity.getIfsCode())
                .ibanCode(entity.getIbanCode())
                .corporateId(entity.getCorporateId())
                .locationBranch(entity.getLocationBranch())
                .branchAddress(entity.getBranchAddress())
                .beneficiaryMailId(entity.getBeneficiaryMailId())
                .build();
    }
}