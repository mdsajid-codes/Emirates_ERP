package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.enums.VendorType;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorDetailResponse {
    private Long id;
    private String vendorCode;
    private String companyName;
    private String displayName;
    private VendorType vendorType;
    private VendorStatus vendorStatus;
    private Boolean isBlacklisted;
    private String blacklistReason;
    private String primaryEmail;
    private String alternateEmail;
    private String primaryPhone;
    private String faxNumber;
    private String website;
    private String taxId;
    private String federalId;
    private String address;
    private String city;
    private Long stateId;
    private String stateName;
    private Long countryId;
    private String countryName;
    private String zipCode;
    private Long primaryBusinessUnitId;
    private String primaryBusinessUnitName;
    private List<BuRef> businessUnits;
    private Long vendorLeadId;
    private String vendorLeadName;
    private Long ownerId;
    private String ownerName;
    private Long createdById;
    private String createdByName;
    private String technologies;
    private String aboutVendor;
    private String notes;
    private String ownership;
    private String vendorVisibility;
    private Boolean sendRequirement;
    private Boolean sendHotlist;
    private Boolean allowAccessToAllUsers;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private List<AtsVendorContactResponse> contacts;
    private AtsVendorAccountResponse account;
    private AtsVendorSubmissionFormatResponse submissionFormat;
    private List<AtsVendorBankAccountResponse> bankAccounts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BuRef {
        private Long id;
        private String name;
        private String code;
    }
}
