package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;

@Data
public class CompanyLocationRequest {
    private Long id; // For updates
    private String locationName;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Boolean isPrimary;
}
