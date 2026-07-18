package com.example.multi_tanent.tenant.employee.dto;

import lombok.Data;

@Data
public class TimeAttendenceRequest {
    private Long timeTypeId;
    private Long workTypeId;
    private Long weeklyOffPolicyId;
    private Long leaveGroupId;
    private Long attendancePolicyId;
    private String attendenceCaptureScheme;
    private String holidayList;
    private String expensePolicy;
    private Boolean isRosterBasedEmployee;
}