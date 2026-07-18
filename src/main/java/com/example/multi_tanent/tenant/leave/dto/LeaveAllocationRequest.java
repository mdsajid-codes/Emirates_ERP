package com.example.multi_tanent.tenant.leave.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LeaveAllocationRequest {
    private String employeeCode;
    private String leaveType;
    private BigDecimal allocatedDays;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String source;
}