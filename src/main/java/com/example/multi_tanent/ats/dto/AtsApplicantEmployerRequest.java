package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.entity.AtsApplicantEmployer.EmployerMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantEmployerRequest {

    @NotNull(message = "Mode is required")
    private EmployerMode mode;

    private Long vendorId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String employerName;
    private String officeNumber;
    private String officeExtension;
    private String email;
    private String mobileNumber;
    private String status;
}
