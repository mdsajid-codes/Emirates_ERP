package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.entity.ShiftPolicy;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ShiftPolicyResponse {
    private Long id;
    private String policyName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private String description;
    private Boolean isDefault;
    private Integer breakMinutes;
    private Boolean isNightShift;

    public static ShiftPolicyResponse fromEntity(ShiftPolicy policy) {
        if (policy == null) return null;
        ShiftPolicyResponse dto = new ShiftPolicyResponse();
        dto.setId(policy.getId());
        dto.setPolicyName(policy.getPolicyName());
        dto.setShiftStartTime(policy.getShiftStartTime());
        dto.setShiftEndTime(policy.getShiftEndTime());
        dto.setDescription(policy.getDescription());
        dto.setIsDefault(policy.getIsDefault());
        dto.setBreakMinutes(policy.getBreakMinutes());
        dto.setIsNightShift(policy.getIsNightShift());
        return dto;
    }
}