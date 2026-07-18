package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientRequest {

    @NotBlank(message = "Client name is required")
    @Size(max = 200, message = "Client name cannot exceed 200 characters")
    private String clientName;

    @Size(max = 50, message = "Client visibility cannot exceed 50 characters")
    private String clientVisibility;

    private Long primaryBusinessUnitId;

    private List<Long> businessUnitIds;

    @Size(max = 500, message = "Client facilities cannot exceed 500 characters")
    private String clientFacilities;

    @Size(max = 200, message = "VMS client name cannot exceed 200 characters")
    private String vmsClientName;

    @Size(max = 100, message = "Federal ID cannot exceed 100 characters")
    private String federalId;

    @Size(max = 50, message = "Contact number cannot exceed 50 characters")
    private String contactNumber;

    @Email(message = "Email ID must be a valid email address")
    @Size(max = 150, message = "Email ID cannot exceed 150 characters")
    private String emailId;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    private Long parentClientId;

    private Boolean notifyUserNearLocation;

    private Long countryId;

    private Long stateId;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 20, message = "Postal code cannot exceed 20 characters")
    private String postalCode;

    @NotBlank(message = "Website is required")
    @Size(max = 255, message = "Website cannot exceed 255 characters")
    private String website;

    private Boolean sendRequirement;

    private Boolean sendHotlist;

    @Size(max = 50, message = "Fax cannot exceed 50 characters")
    private String fax;

    @Size(max = 100, message = "Industry cannot exceed 100 characters")
    private String industry;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    private Long primaryOwnerId;

    @Size(max = 100, message = "Ownership cannot exceed 100 characters")
    private String ownership;

    private Long clientLeadId;

    private List<Long> requiredDocumentTypeIds;

    private Boolean allowAccessToAllUsers;

    private Boolean displayOnJob;

    private Long paymentTermsId;

    @Size(max = 100, message = "Practice cannot exceed 100 characters")
    private String practice;

    @Size(max = 4000, message = "About company cannot exceed 4000 characters")
    private String aboutCompany;

    private Boolean stopSubmitEmailNotification;

    private Boolean defaultAddressForJobs;

    @Size(max = 100, message = "Client short name cannot exceed 100 characters")
    private String clientShortName;
}
