package com.example.multi_tanent.tenant.payroll.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payroll_settings")
@Data
public class PayrollSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Should only be one record per tenant

    @Column(nullable = false, name = "pay_frequency")
    private String payFrequency; // e.g., MONTHLY, BI_WEEKLY

    @Column(nullable = false, name = "pay_cycle_day")
    private Integer payCycleDay; // e.g., 1 for 1st of the month

    @Column(nullable = false, name = "payslip_generation_day")
    private Integer payslipGenerationDay; // Day of the month to generate payslips

    @Column(name = "include_holidays_in_payslip")
    private Boolean includeHolidaysInPayslip;

    @Column(name = "include_leave_balance_in_payslip")
    private Boolean includeLeaveBalanceInPayslip;
}