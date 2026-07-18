package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantEducationRequest {

    @NotNull(message = "Degree ID is required")
    private Long degreeId;

    @NotBlank(message = "School/University name is required")
    private String schoolName;

    private Integer yearCompleted;

    private String majorStudy;

    private String minorStudy;

    private BigDecimal gpa;

    @NotNull(message = "Country ID is required")
    private Long countryId;

    private Long stateId;

    private String city;

    @Builder.Default
    private Boolean higherEducation = false;
}
