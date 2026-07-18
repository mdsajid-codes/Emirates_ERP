package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.enums.VendorType;
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
public class AtsVendorRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name cannot exceed 200 characters")
    private String companyName;

    @Size(max = 50, message = "Vendor code cannot exceed 50 characters")
    private String vendorCode;

    @Size(max = 200, message = "Display name cannot exceed 200 characters")
    private String displayName;

    private VendorType vendorType;

    private VendorStatus vendorStatus;

    @NotBlank(message = "Primary email is required")
    @Email(message = "Primary email must be a valid email address")
    @Size(max = 150, message = "Primary email cannot exceed 150 characters")
    private String primaryEmail;

    @Size(max = 150, message = "Alternate email cannot exceed 150 characters")
    private String alternateEmail;

    @Size(max = 30, message = "Primary phone cannot exceed 30 characters")
    private String primaryPhone;

    @Size(max = 30, message = "Fax number cannot exceed 30 characters")
    private String faxNumber;

    @Size(max = 500, message = "Website cannot exceed 500 characters")
    private String website;

    @Size(max = 255, message = "Tax ID cannot exceed 255 characters")
    private String taxId;

    @Size(max = 100, message = "Federal ID cannot exceed 100 characters")
    private String federalId;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    private Long stateId;

    private Long countryId;

    @Size(max = 20, message = "Zip code cannot exceed 20 characters")
    private String zipCode;

    private Long primaryBusinessUnitId;

    private List<Long> businessUnitIds;

    private Long vendorLeadId;

    private Long ownerId;

    @Size(max = 1000, message = "Technologies cannot exceed 1000 characters")
    private String technologies;

    @Size(max = 4000, message = "About Vendor cannot exceed 4000 characters")
    private String aboutVendor;

    @Size(max = 4000, message = "Notes cannot exceed 4000 characters")
    private String notes;

    @Size(max = 200, message = "Ownership cannot exceed 200 characters")
    private String ownership;

    @Size(max = 50, message = "Vendor visibility cannot exceed 50 characters")
    private String vendorVisibility;

    private Boolean sendRequirement;

    private Boolean sendHotlist;

    private Boolean allowAccessToAllUsers;
}
