package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.tenant.payroll.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_runs")
@Data
public class PayrollRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int month;

    @Column(name = "pay_period_start")
    private LocalDate payPeriodStart;

    @Column(name = "pay_period_end")
    private LocalDate payPeriodEnd;

    @Column(name = "pay_date")
    private LocalDate payDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PayrollStatus status; // DRAFT, PROCESSING, COMPLETED, PAID

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "executed_by_user_id")
    private Long executedByUserId;
}