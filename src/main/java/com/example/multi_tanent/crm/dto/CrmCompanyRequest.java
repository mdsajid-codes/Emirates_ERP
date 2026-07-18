package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrmCompanyRequest {

    @NotBlank(message = "Company name is required.")
    private String name;

    private Long locationId;
    private Long companyTypeId;
    private Long industryId;

    private String companyOwner;
    private Long parentCompanyId;

    private String phone;

    @Email(message = "Please provide a valid email address.")
    private String email;

    private String website;

    private String billingStreet;
    private String billingCity;
    private String billingZip;
    private String billingState;
    private String billingCountry;

    private String shippingStreet;
    private String shippingCity;
    private String shippingZip;
    private String shippingState;
    private String shippingCountry;
}