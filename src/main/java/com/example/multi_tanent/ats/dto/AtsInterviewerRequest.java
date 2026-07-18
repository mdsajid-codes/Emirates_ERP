package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsInterviewerRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must be under 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must be under 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must be under 150 characters")
    private String email;

    @Size(max = 150, message = "Job title must be under 150 characters")
    private String jobTitle;

    @Size(max = 30, message = "Mobile number must be under 30 characters")
    private String mobileNumber;

    @Size(max = 100, message = "Technology must be under 100 characters")
    private String technology;

    private Long businessUnitId;

    private Boolean calendarSyncNotification;

    private String workingHoursStart;

    private String workingHoursEnd;

    private Boolean workingHoursApplyWeekends;

    private Boolean isActive;
}
