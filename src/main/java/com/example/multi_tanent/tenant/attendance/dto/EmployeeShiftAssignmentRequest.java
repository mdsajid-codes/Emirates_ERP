package com.example.multi_tanent.tenant.attendance.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeShiftAssignmentRequest {
    private Long employeeId;
    private Long shiftTypeId;
    private LocalDate assignedDate;
    private String notes;
}
