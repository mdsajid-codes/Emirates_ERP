package com.example.multi_tanent.tenant.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AttendanceCapturingPolicyRequest {
    @NotBlank(message = "Policy name is required")
    private String policyName;

    private Integer graceTimeMinutes;
    private Integer halfDayThresholdMinutes;
    private Boolean allowMultiplePunches;
    private String lateMarkRules;
}