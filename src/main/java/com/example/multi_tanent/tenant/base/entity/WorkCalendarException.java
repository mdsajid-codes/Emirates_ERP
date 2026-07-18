package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "work_calendar_exceptions")
@Data
public class WorkCalendarException {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holiday_policy_id", nullable = false)
    private HolidayPolicy holidayPolicy;

    @Column(name = "exception_date", nullable = false)
    private LocalDate exceptionDate;

    @Column(name = "is_working_day")
    private Boolean workingDay;

    private String reason;
}
