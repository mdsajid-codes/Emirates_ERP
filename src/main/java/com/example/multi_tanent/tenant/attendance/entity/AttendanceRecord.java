package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.attendance.enums.AttendanceStatus;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_record", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "employee_id", "attendance_date" })
})
@Data
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in")
    private LocalTime checkIn;

    @Column(name = "check_out")
    private LocalTime checkOut;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, name = "status")
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_policy_id")
    private AttendancePolicy attendancePolicy;

    @Column(name = "is_late")
    private Boolean isLate = false;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes = 0;

    @Column(length = 500)
    private String remarks;

    @Column(precision = 3, scale = 2, name = "payable_days")
    private java.math.BigDecimal payableDays = java.math.BigDecimal.ONE; // 1.0 for full day, 0.5 for half, 0.0 for
                                                                         // absent
}