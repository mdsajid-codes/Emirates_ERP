package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsConsentResponse {
    private Long consentId;
    private Long applicantId;
    private String applicantName;
    private String email;
    private String source;
    private String createdBy;
    private OffsetDateTime createdOn;
    private OffsetDateTime consentSentOn;
    private String emailStatus;
    private String consentStatus;
    private String rejectionReason;
}
