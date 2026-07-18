package com.example.multi_tanent.tenant.leave.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    private String employeeCode;
    private String leaveType; // e.g., "SICK", "CASUAL"
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;
    private BigDecimal daysRequested;
    private String partialDayInfo;
}