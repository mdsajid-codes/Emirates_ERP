package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "work_schedule_days")
@Data
public class WorkScheduleDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_schedule_id", nullable = false)
    private WorkSchedule workSchedule;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek; // MON, TUE, WED, THU, FRI, SAT, SUN

    @Column(name = "working_hours", precision = 5, scale = 2)
    private BigDecimal workingHours = BigDecimal.ZERO;

    @Column(name = "is_working_day")
    private Boolean isWorkingDay = true;
}
