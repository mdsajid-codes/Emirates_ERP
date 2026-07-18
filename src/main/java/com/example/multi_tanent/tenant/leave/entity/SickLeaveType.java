package com.example.multi_tanent.tenant.leave.entity;

import com.example.multi_tanent.tenant.base.entity.TimeType;
import com.example.multi_tanent.tenant.leave.enums.DailyEarningBase;
import com.example.multi_tanent.tenant.leave.enums.SickLeaveCalculationMethod;
import com.example.multi_tanent.tenant.payroll.entity.SalaryComponent;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sick_leave_types")
@Data
public class SickLeaveType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_time_type_id")
    private TimeType workTimeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "earnings_type_id")
    private SalaryComponent earningsType;

    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_method", nullable = false)
    private SickLeaveCalculationMethod calculationMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "daily_earning_base", nullable = false)
    private DailyEarningBase dailyEarningBase;

    @Column(name = "averaging_period_months")
    private Integer averagingPeriodMonths = 1;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "sickLeaveType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SickLeaveInterval> intervals = new ArrayList<>();
}
