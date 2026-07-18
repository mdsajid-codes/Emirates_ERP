package com.example.multi_tanent.tenant.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendancePolicyRequest {
    @NotBlank(message = "Policy name is required")
    private String policyName;

    private Boolean isDefault = false;

    private LocalDate effectiveFrom;

    @NotNull(message = "Shift policy is required")
    private Long shiftPolicyId;

    @NotNull(message = "Capturing policy is required")
    private Long capturingPolicyId;

    @Valid
    private LeaveDeductionConfigRequest leaveDeductionConfig;
}