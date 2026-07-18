package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.enums.VendorType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorFilterRequest {
    private String search;
    private VendorStatus vendorStatus;
    private VendorType vendorType;
    private Boolean isBlacklisted;
    private Long countryId;
    private Long stateId;
    private Long primaryBusinessUnitId;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDir = "DESC";
}
