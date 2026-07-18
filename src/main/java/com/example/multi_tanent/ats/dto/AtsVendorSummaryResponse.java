package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.enums.VendorType;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorSummaryResponse {
    private Long id;
    private String vendorCode;
    private String companyName;
    private String displayName;
    private VendorType vendorType;
    private VendorStatus vendorStatus;
    private Boolean isBlacklisted;
    private String primaryEmail;
    private String primaryPhone;
    private String city;
    private String countryName;
    private String primaryBusinessUnitName;
    private int contactCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
