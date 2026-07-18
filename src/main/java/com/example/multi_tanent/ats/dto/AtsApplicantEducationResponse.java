package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantEducationResponse {
    private Long id;
    private Long applicantId;
    private Long degreeId;
    private String degreeName;
    private String schoolName;
    private Integer yearCompleted;
    private String majorStudy;
    private String minorStudy;
    private BigDecimal gpa;
    private Long countryId;
    private String countryName;
    private Long stateId;
    private String stateName;
    private String city;
    private Boolean higherEducation;
}
