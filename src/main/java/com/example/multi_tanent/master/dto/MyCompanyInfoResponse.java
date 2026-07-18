package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.MyCompanyInfo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class MyCompanyInfoResponse {
    private Long id;
    private String companyName;
    private String logoUrl;
    private String signatureUrl;
    private String stampUrl;
    private String invoiceHeaderUrl;
    private String invoiceFooterUrl;
    private String watermarkUrl;

    // Address
    private String address;
    private String city;
    private String emirate;
    private String poBox;
    private String country;
    private String phone;
    private String email;
    private String website;

    // UAE fields
    private String tradeLicenseNumber;
    private LocalDate tradeLicenseExpiry;
    private String trn;
    private String mohreEstablishmentId;
    private Integer visaQuotaTotal;
    private String employerBankRoutingCode;

    private List<MyBankDetailsResponse> bankDetails;
    private List<MyCustomFieldResponse> customFields;

    public static MyCompanyInfoResponse fromEntity(MyCompanyInfo entity) {
        return MyCompanyInfoResponse.builder()
                .id(entity.getId())
                .companyName(entity.getCompanyName())
                .logoUrl(entity.getLogoUrl())
                .signatureUrl(entity.getSignatureUrl())
                .stampUrl(entity.getStampUrl())
                .invoiceHeaderUrl(entity.getInvoiceHeaderUrl())
                .invoiceFooterUrl(entity.getInvoiceFooterUrl())
                .watermarkUrl(entity.getWatermarkUrl())
                .address(entity.getAddress())
                .city(entity.getCity())
                .emirate(entity.getEmirate())
                .poBox(entity.getPoBox())
                .country(entity.getCountry())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .tradeLicenseNumber(entity.getTradeLicenseNumber())
                .tradeLicenseExpiry(entity.getTradeLicenseExpiry())
                .trn(entity.getTrn())
                .mohreEstablishmentId(entity.getMohreEstablishmentId())
                .visaQuotaTotal(entity.getVisaQuotaTotal())
                .employerBankRoutingCode(entity.getEmployerBankRoutingCode())
                .bankDetails(entity.getBankAccounts() != null ? entity.getBankAccounts().stream()
                        .map(MyBankDetailsResponse::fromEntity)
                        .collect(Collectors.toList()) : null)
                .customFields(entity.getCustomFields() != null ? entity.getCustomFields().stream()
                        .map(MyCustomFieldResponse::fromEntity)
                        .collect(Collectors.toList()) : null)
                .build();
    }
}
