package com.example.multi_tanent.tenant.attendance.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum AttendanceMethod {
    MANUAL,
    BIOMETRIC,
    APP,
    GPS,
    RFID;

    @JsonCreator
    public static AttendanceMethod fromString(String value) {
        return value == null ? null : AttendanceMethod.valueOf(value.toUpperCase());
    }
}