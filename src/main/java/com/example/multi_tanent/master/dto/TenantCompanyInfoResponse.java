package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.TenantCompanyInfo;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class TenantCompanyInfoResponse {
    private Long id;
    private Long masterTenantId;
    private String companyName;
    private String logoUrl;

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

    public static TenantCompanyInfoResponse fromEntity(TenantCompanyInfo entity) {
        return TenantCompanyInfoResponse.builder()
                .id(entity.getId())
                .masterTenantId(entity.getMasterTenant() != null ? entity.getMasterTenant().getId() : null)
                .companyName(entity.getCompanyName())
                .logoUrl(entity.getLogoUrl())
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .country(entity.getCountry())
                .zipCode(entity.getZipCode())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .taxId(entity.getTaxId())
                .registrationNumber(entity.getRegistrationNumber())
                .emirate(entity.getEmirate())
                .poBox(entity.getPoBox())
                .tradeLicenseNumber(entity.getTradeLicenseNumber())
                .tradeLicenseExpiry(entity.getTradeLicenseExpiry())
                .trn(entity.getTrn())
                .mohreEstablishmentId(entity.getMohreEstablishmentId())
                .visaQuotaTotal(entity.getVisaQuotaTotal())
                .employerBankRoutingCode(entity.getEmployerBankRoutingCode())
                .build();
    }
}
