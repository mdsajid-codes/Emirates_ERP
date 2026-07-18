package com.example.multi_tanent.tenant.attendance.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance_capturing_policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCapturingPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "policy_name")
    private String policyName;

    @Column(name = "grace_time_minutes")
    private Integer graceTimeMinutes;

    @Column(name = "half_day_threshold_minutes")
    private Integer halfDayThresholdMinutes; // if total working minutes < threshold -> half day

    @Column(name = "allow_multiple_punches")
    private Boolean allowMultiplePunches;

    @Column(name = "late_mark_rules")
    private String lateMarkRules; // description or JSON for complex rules
}
