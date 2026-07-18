package com.example.multi_tanent.ats.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientSummaryResponse {
    private Long id;
    private String clientName;
    private String clientShortName;
    private String emailId;
    private String contactNumber;
    private String status;
    private String website;
    private String city;
    private String countryName;
    private String primaryOwnerName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
