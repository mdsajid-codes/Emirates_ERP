package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsVendorBankAccountResponse {
    private Long id;
    private Long vendorId;
    private String beneficiaryName;
    private String bankName;
    private String accountType;
    private String ifscRouting;
    private String accountNumber;
    private String depositAmount;
    private String priority;
    private String comments;
    private String addressLine1;
    private String addressLine2;
    private Long countryId;
    private String countryName;
    private Long stateId;
    private String stateName;
    private String city;
    private String zipCode;
    private String cancelledChequePath;
    private String cancelledChequeName;
    private String recordStatus;
    private String attachmentPath;
    private String attachmentName;
}
