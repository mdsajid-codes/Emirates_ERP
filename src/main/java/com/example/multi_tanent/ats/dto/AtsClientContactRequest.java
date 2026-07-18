package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientContactRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 150)
    private String designation;

    @Size(max = 30)
    private String officeNumber;

    @Size(max = 10)
    private String officeExtension;

    @Size(max = 30)
    private String mobileNumber;

    @NotBlank(message = "Email ID is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150)
    private String emailId;

    @Email(message = "Must be a valid email address")
    @Size(max = 150)
    private String secondaryEmailId;

    @NotNull(message = "Primary owner ID is required")
    private Long primaryOwnerId;

    @Size(max = 100)
    private String ownership;

    private Boolean allowAccessToAllUsers;

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
    private String linkedinProfileUrl;

    @Size(max = 500)
    private String facebookProfileUrl;

    @Size(max = 500)
    private String twitterProfileUrl;

    @Size(max = 500)
    private String googlePlusProfileUrl;

    @Size(max = 50)
    private String status;

    @Size(max = 100)
    private String clientGroup;

    @Size(max = 2000)
    private String aboutTheContact;
}
