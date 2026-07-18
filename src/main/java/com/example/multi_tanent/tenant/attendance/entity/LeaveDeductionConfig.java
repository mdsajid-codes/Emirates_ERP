package com.example.multi_tanent.tenant.attendance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leave_deduction_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveDeductionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", unique = true)
    private AttendancePolicy policy;

    // Q1: Missing Attendance
    @Column(name = "deduct_missing_attendance")
    private Boolean deductMissingAttendance = false;

    // Q2: Late Arrival
    @Column(name = "penalize_late_arrival")
    private Boolean penalizeLateArrival = false;

    // Q3: Work Hours Shortage
    @Column(name = "deduct_for_work_hours_shortage")
    private Boolean deductForWorkHoursShortage = false;

    // Q4: Missing Swipes
    @Column(name = "deduct_for_missing_swipes")
    private Boolean deductForMissingSwipes = false;

    // Q5: Early Going
    @Column(name = "penalize_early_going")
    private Boolean penalizeEarlyGoing = false;
}