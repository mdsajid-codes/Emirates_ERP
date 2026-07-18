package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorContactRequest {

    private Boolean isPrimary;

    @Size(max = 20)
    private String salutation;

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @Size(max = 150)
    private String title;

    @Size(max = 150)
    private String designation;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 10)
    private String phoneExtension;

    @Size(max = 30)
    private String mobile;

    @Size(max = 250)
    private String address1;

    @Size(max = 250)
    private String address2;

    private Long countryId;

    private Long stateId;

    @Size(max = 100)
    private String city;

    @Size(max = 20)
    private String zipCode;

    @Size(max = 500)
    private String linkedinUrl;

    @Size(max = 500)
    private String facebookUrl;

    @Size(max = 500)
    private String twitterUrl;

    @Size(max = 500)
    private String googlePlusUrl;

    @Size(max = 50)
    private String status;

    @Size(max = 1000)
    private String technologies;

    private Long ownerId;

    private Boolean allowAccessToAllUsers;

    @Size(max = 2000)
    private String comment;

    private Boolean sendRequirement;

    private Boolean sendHotlist;

    @Size(max = 100)
    private String vendorContactType;

    @Size(max = 100)
    private String vendorGroup;
}
