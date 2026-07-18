package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.PayrollRun;
import com.example.multi_tanent.tenant.payroll.enums.PayrollStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PayrollRunResponse {
    private Long id;
    private int year;
    private int month;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private PayrollStatus status;
    private LocalDateTime executedAt;
    private Long executedByUserId;

    public static PayrollRunResponse fromEntity(PayrollRun payrollRun) {
        if (payrollRun == null) return null;
        PayrollRunResponse dto = new PayrollRunResponse();
        dto.setId(payrollRun.getId());
        dto.setYear(payrollRun.getYear());
        dto.setMonth(payrollRun.getMonth());
        dto.setPayPeriodStart(payrollRun.getPayPeriodStart());
        dto.setPayPeriodEnd(payrollRun.getPayPeriodEnd());
        dto.setStatus(payrollRun.getStatus());
        dto.setExecutedAt(payrollRun.getExecutedAt());
        dto.setExecutedByUserId(payrollRun.getExecutedByUserId());
        return dto;
    }
}