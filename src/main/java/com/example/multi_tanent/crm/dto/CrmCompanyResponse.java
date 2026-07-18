package com.example.multi_tanent.crm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class CrmCompanyResponse {
    private Long id;
    private String name;

    private Long locationId;
    private String locationName;

    private Long companyTypeId;
    private String companyTypeName;

    private Long industryId;
    private String industryName;

    private String phone;
    private String email;
    private String website;

    private String companyOwner;

    private Long parentCompanyId;
    private String parentCompanyName;

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

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}