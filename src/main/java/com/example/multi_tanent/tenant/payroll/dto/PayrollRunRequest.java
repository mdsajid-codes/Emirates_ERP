package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PayrollRunRequest {
    private int year;
    private int month;
    private LocalDate payDate;
}