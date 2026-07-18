package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantCertificationRequest {

    @NotBlank(message = "Certification name is required")
    private String certificationName;

    private LocalDate completedDate;

    private String comments;
}
