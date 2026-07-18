package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_schedules")
@Data
public class WorkSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holiday_policy_id")
    private HolidayPolicy holidayPolicy;

    @Column(name = "total_weekly_hours")
    private Integer totalWeeklyHours = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "workSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkScheduleDay> days = new ArrayList<>();
}
