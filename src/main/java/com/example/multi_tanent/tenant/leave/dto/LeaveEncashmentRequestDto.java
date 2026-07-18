package com.example.multi_tanent.tenant.leave.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class LeaveEncashmentRequestDto {
    private String employeeCode;
    private String leaveType;
    private BigDecimal daysToEncash;
}