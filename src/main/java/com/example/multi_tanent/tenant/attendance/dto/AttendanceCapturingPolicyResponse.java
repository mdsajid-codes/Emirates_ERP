package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.entity.AttendanceCapturingPolicy;
import lombok.Data;

@Data
public class AttendanceCapturingPolicyResponse {
    private Long id;
    private String policyName;
    private Integer graceTimeMinutes;
    private Integer halfDayThresholdMinutes;
    private Boolean allowMultiplePunches;
    private String lateMarkRules;

    public static AttendanceCapturingPolicyResponse fromEntity(AttendanceCapturingPolicy policy) {
        if (policy == null) return null;
        AttendanceCapturingPolicyResponse dto = new AttendanceCapturingPolicyResponse();
        dto.setId(policy.getId());
        dto.setPolicyName(policy.getPolicyName());
        dto.setGraceTimeMinutes(policy.getGraceTimeMinutes());
        dto.setHalfDayThresholdMinutes(policy.getHalfDayThresholdMinutes());
        dto.setAllowMultiplePunches(policy.getAllowMultiplePunches());
        dto.setLateMarkRules(policy.getLateMarkRules());
        return dto;
    }
}