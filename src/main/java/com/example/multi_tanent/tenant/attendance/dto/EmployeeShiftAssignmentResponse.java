package com.example.multi_tanent.tenant.attendance.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EmployeeShiftAssignmentResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private Long shiftTypeId;
    private String shiftTypeName;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate assignedDate;
    private String notes;
}
