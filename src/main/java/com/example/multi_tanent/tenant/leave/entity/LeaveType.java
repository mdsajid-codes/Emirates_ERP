package com.example.multi_tanent.tenant.leave.entity;

import jakarta.persistence.*;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Table(name = "leave_types")
@Data
public class LeaveType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "leave_type")
    private String leaveType;

    @Column(name = "description")
    private String description;

    @Column(nullable = false, name = "is_paid")
    private Boolean isPaid;

    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;

    @Column(nullable = false, name = "active")
    private Boolean active = true;

    @Column(name = "start_time")
    private LocalTime startTime;
    @Column(name = "end_time")
    private LocalTime endTime;

}