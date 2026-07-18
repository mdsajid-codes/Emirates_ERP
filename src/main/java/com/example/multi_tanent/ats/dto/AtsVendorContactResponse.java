package com.example.multi_tanent.ats.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorContactResponse {
    private Long id;
    private Long vendorId;
    private String vendorName;
    private Boolean isPrimary;
    private String salutation;
    private String firstName;
    private String lastName;
    private String title;
    private String designation;
    private String email;
    private String phone;
    private String phoneExtension;
    private String mobile;
    private String address1;
    private String address2;
    private Long countryId;
    private String countryName;
    private Long stateId;
    private String stateName;
    private String city;
    private String zipCode;
    private String linkedinUrl;
    private String facebookUrl;
    private String twitterUrl;
    private String googlePlusUrl;
    private String status;
    private String technologies;
    private Long ownerId;
    private String ownerName;
    private Boolean allowAccessToAllUsers;
    private String comment;
    private Boolean sendRequirement;
    private Boolean sendHotlist;
    private String vendorContactType;
    private String vendorGroup;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
