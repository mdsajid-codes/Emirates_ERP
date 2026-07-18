package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.entity.AttendancePolicy;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendancePolicyResponse {
    private Long id;
    private String policyName;
    private Boolean isDefault;
    private LocalDate effectiveFrom;
    private ShiftPolicyResponse shiftPolicy;
    private AttendanceCapturingPolicyResponse capturingPolicy;
    private LeaveDeductionConfigResponse leaveDeductionConfig;

    public static AttendancePolicyResponse fromEntity(AttendancePolicy policy) {
        if (policy == null) {
            return null;
        }

        AttendancePolicyResponse dto = new AttendancePolicyResponse();
        dto.setId(policy.getId());
        dto.setPolicyName(policy.getPolicyName());
        dto.setIsDefault(policy.getIsDefault());
        dto.setEffectiveFrom(policy.getEffectiveFrom());

        // Eagerly load the lazy associations before the session closes
        dto.setShiftPolicy(ShiftPolicyResponse.fromEntity(policy.getShiftPolicy()));
        dto.setCapturingPolicy(AttendanceCapturingPolicyResponse.fromEntity(policy.getCapturingPolicy()));
        dto.setLeaveDeductionConfig(LeaveDeductionConfigResponse.fromEntity(policy.getLeaveDeductionConfig()));

        // To prevent further lazy loading issues, you might want to null out nested lazy fields
        // if they exist, but for ShiftPolicy and AttendanceCapturingPolicy, it seems okay for now.
        // For example:
        // if (dto.getShiftPolicy() != null) { dto.getShiftPolicy().setSomeLazyField(null); }

        return dto;
    }
}