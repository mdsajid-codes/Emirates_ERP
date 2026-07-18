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
public class AtsApplicantWorkExperienceResponse {
    private Long id;
    private Long applicantId;
    private String employerName;
    private String jobTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
    private String location;
    private String description;
}
