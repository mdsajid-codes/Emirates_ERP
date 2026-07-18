package com.example.multi_tanent.tenant.attendance.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class ShiftPolicyRequest {
    private String policyName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private Boolean isDefault;
    private Integer breakMinutes;
    private Boolean isNightShift;
    private String description;
}
