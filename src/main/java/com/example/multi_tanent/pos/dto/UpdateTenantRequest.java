package com.example.multi_tanent.pos.dto;

import lombok.Data;

@Data
public class UpdateTenantRequest {
    private String name;
    private String logoImgUrl;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String smtpHost;
    private Integer smtpPort;
    private String smtpUsername;
    private String smtpPassword;
    private String companyEmail;
}