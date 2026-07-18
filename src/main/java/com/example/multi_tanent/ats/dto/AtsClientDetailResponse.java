package com.example.multi_tanent.ats.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientDetailResponse {
    private Long id;
    private String clientName;
    private String clientShortName;
    private String clientVisibility;
    private String clientFacilities;
    private String vmsClientName;
    private String federalId;
    private String contactNumber;
    private String emailId;
    private String address;
    private Long parentClientId;
    private String parentClientName;
    private Boolean notifyUserNearLocation;
    private Long countryId;
    private String countryName;
    private Long stateId;
    private String stateName;
    private String city;
    private String postalCode;
    private String website;
    private Boolean sendRequirement;
    private Boolean sendHotlist;
    private String fax;
    private String industry;
    private String status;
    private String category;
    private Long primaryOwnerId;
    private String primaryOwnerName;
    private String ownership;
    private Long clientLeadId;
    private String clientLeadName;
    private Boolean allowAccessToAllUsers;
    private Boolean displayOnJob;
    private Long paymentTermsId;
    private String paymentTermsName;
    private String practice;
    private String aboutCompany;
    private Boolean stopSubmitEmailNotification;
    private Boolean defaultAddressForJobs;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Long primaryBusinessUnitId;
    private String primaryBusinessUnitName;
    private List<BuRef> businessUnits;
    private List<DocTypeRef> requiredDocuments;

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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocTypeRef {
        private Long id;
        private String name;
    }
}
