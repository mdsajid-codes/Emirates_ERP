package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.entity.AttendanceRecord;
import com.example.multi_tanent.tenant.attendance.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordResponse {
    private Long id;
    private String employeeCode;
    private String employeeName;
    private LocalDate attendanceDate;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private AttendanceStatus status;
    private Long attendancePolicyId;
    private Boolean isLate;
    private Integer overtimeMinutes;
    private String remarks;

    public static AttendanceRecordResponse fromEntity(AttendanceRecord entity) {
        if (entity == null) {
            return null;
        }

        String employeeName = (entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName()).trim();

        return new AttendanceRecordResponse(
                entity.getId(),
                entity.getEmployee().getEmployeeCode(),
                employeeName,
                entity.getAttendanceDate(),
                entity.getCheckIn(),
                entity.getCheckOut(),
                entity.getStatus(),
                entity.getAttendancePolicy() != null ? entity.getAttendancePolicy().getId() : null,
                entity.getIsLate(),
                entity.getOvertimeMinutes(),
                entity.getRemarks()
        );
    }
}