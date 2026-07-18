package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.payroll.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "payslips", indexes = {
        @Index(name = "idx_payslip_employee_period", columnList = "employee_id, year, month")
})
@Data
public class Payslip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id")
    private PayrollRun payrollRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false, name = "pay_date")
    private LocalDate payDate;

    @Column(nullable = false, precision = 15, scale = 2, name = "gross_earnings")
    private BigDecimal grossEarnings;

    @Column(nullable = false, precision = 15, scale = 2, name = "total_deductions")
    private BigDecimal totalDeductions;

    @Column(nullable = false, precision = 15, scale = 2, name = "net_salary")
    private BigDecimal netSalary;

    @Column(name = "work_expenses", precision = 15, scale = 2)
    private BigDecimal workExpenses = BigDecimal.ZERO;

    @Column(name = "net_additions", precision = 15, scale = 2)
    private BigDecimal netAdditions = BigDecimal.ZERO;

    @Column(name = "arrears_addition", precision = 15, scale = 2)
    private BigDecimal arrearsAddition = BigDecimal.ZERO;

    @Column(name = "arrears_deduction", precision = 15, scale = 2)
    private BigDecimal arrearsDeduction = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    private PayrollStatus status;

    @OneToMany(mappedBy = "payslip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayslipComponent> components;

    @Column(name = "total_days_in_month")
    private Integer totalDaysInMonth;

    @Column(name = "payable_days")
    private BigDecimal payableDays;

    @Column(name = "loss_of_pay_days")
    private BigDecimal lossOfPayDays;

    @Column(length = 1000, name = "leave_balance_summary")
    private String leaveBalanceSummary; // e.g., "CL: 5.0, SL: 10.0, EL: 12.5"

}