package com.example.multi_tanent.ats.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientFilterRequest {
    private String search;
    private String status;
    private Long countryId;
    private Long stateId;
    private Long primaryBusinessUnitId;
    private Long primaryOwnerId;
    private Long clientLeadId;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDir = "DESC";
}
