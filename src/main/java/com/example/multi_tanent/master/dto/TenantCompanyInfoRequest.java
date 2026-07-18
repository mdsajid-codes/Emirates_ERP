package com.example.multi_tanent.master.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

@Data
public class TenantCompanyInfoRequest {
    private String companyName;
    private MultipartFile logoImage;

    // Address & Contact
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String phone;
    private String email;
    private String website;

    // Statutory / Legal
    private String taxId;
    private String registrationNumber;

    // UAE Specifics
    private String emirate;
    private String poBox;
    private String tradeLicenseNumber;
    private LocalDate tradeLicenseExpiry;
    private String trn;
    private String mohreEstablishmentId;
    private Integer visaQuotaTotal;
    private String employerBankRoutingCode;
}
