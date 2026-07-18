package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.entity.AtsApplicantEmployer.EmployerMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantEmployerResponse {
    private Long id;
    private Long applicantId;

    private EmployerMode mode;
    private String firstName;
    private String lastName;
    private String employerName;
    private String officeNumber;
    private String officeExtension;
    private String email;
    private String mobileNumber;
    private String status;
    private Long vendorId;
    private String vendorName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
