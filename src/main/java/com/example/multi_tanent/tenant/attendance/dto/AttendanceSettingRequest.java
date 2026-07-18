package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.enums.AttendanceMethod;
import lombok.Data;

@Data
public class AttendanceSettingRequest {
    private AttendanceMethod method;
    private Integer defaultGraceMinutes;
    private Boolean autoMarkAbsentAfter;
    private Integer absentAfterMinutes;
}