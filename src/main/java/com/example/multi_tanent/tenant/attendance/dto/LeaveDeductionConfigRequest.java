package com.example.multi_tanent.tenant.attendance.dto;

import lombok.Data;

@Data
public class LeaveDeductionConfigRequest {
    private Boolean deductMissingAttendance = false;
    private Boolean penalizeLateArrival = false;
    private Boolean deductForWorkHoursShortage = false;
    private Boolean deductForMissingSwipes = false;
    private Boolean penalizeEarlyGoing = false;
}