package com.example.multi_tanent.ats.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientContactResponse {
    private Long id;
    private Long clientId;
    private String firstName;
    private String lastName;
    private String designation;
    private String officeNumber;
    private String officeExtension;
    private String mobileNumber;
    private String emailId;
    private String secondaryEmailId;
    private Long primaryOwnerId;
    private String primaryOwnerName;
    private String ownership;
    private Boolean allowAccessToAllUsers;
    private String address1;
    private String address2;
    private Long countryId;
    private String countryName;
    private Long stateId;
    private String stateName;
    private String city;
    private String zipCode;
    private String linkedinProfileUrl;
    private String facebookProfileUrl;
    private String twitterProfileUrl;
    private String googlePlusProfileUrl;
    private String status;
    private String clientGroup;
    private String aboutTheContact;
}
