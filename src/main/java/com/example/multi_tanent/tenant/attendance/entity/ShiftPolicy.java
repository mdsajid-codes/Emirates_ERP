package com.example.multi_tanent.tenant.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Table(name = "shift_policy")
@Data
public class ShiftPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_name", nullable = false, unique = true, length = 100)
    private String policyName;

    @Column(name = "shift_start_time", nullable = false)
    private LocalTime shiftStartTime;

    @Column(name = "shift_end_time", nullable = false)
    private LocalTime shiftEndTime;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "break_minutes")
    private Integer breakMinutes = 0;

    @Column(name = "is_night_shift")
    private Boolean isNightShift = false;

    @Column(length = 500)
    private String description;
}