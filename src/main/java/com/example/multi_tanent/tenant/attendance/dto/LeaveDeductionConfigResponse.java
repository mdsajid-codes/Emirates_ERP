package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.entity.LeaveDeductionConfig;
import lombok.Data;

@Data
public class LeaveDeductionConfigResponse {
    private Long id;
    private Boolean deductMissingAttendance;
    private Boolean penalizeLateArrival;
    private Boolean deductForWorkHoursShortage;
    private Boolean deductForMissingSwipes;
    private Boolean penalizeEarlyGoing;

    public static LeaveDeductionConfigResponse fromEntity(LeaveDeductionConfig config) {
        if (config == null) return null;
        LeaveDeductionConfigResponse dto = new LeaveDeductionConfigResponse();
        dto.setId(config.getId());
        dto.setDeductMissingAttendance(config.getDeductMissingAttendance());
        dto.setPenalizeLateArrival(config.getPenalizeLateArrival());
        dto.setDeductForWorkHoursShortage(config.getDeductForWorkHoursShortage());
        dto.setDeductForMissingSwipes(config.getDeductForMissingSwipes());
        dto.setPenalizeEarlyGoing(config.getPenalizeEarlyGoing());
        return dto;
    }
}