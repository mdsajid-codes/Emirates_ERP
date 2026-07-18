package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantLanguageResponse {
    private Long id;
    private Long applicantId;
    private String languageName;
    private Boolean canRead;
    private Boolean canSpeak;
    private Boolean canWrite;
}
