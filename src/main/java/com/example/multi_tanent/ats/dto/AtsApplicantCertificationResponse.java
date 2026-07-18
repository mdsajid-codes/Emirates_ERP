package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantCertificationResponse {
    private Long id;
    private Long applicantId;
    private String certificationName;
    private LocalDate completedDate;
    private String comments;
}
