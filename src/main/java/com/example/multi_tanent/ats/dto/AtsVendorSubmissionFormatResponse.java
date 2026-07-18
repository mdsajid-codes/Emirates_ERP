package com.example.multi_tanent.ats.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorSubmissionFormatResponse {
    private Long id;
    private String submissionDescription;
    private String mailDescription;
    private String mailingSubject;
    private String body;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
