package com.example.multi_tanent.tenant.leave.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.leave.enums.LeaveStatus;

@Entity
@Table(name = "leave_requests", indexes = { @Index(name = "idx_leave_request_employee", columnList = "employee_id") })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // who applied
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    // date range (support multi-day requests)
    @Column(name = "from_date")
    private LocalDate fromDate;

    @Column(name = "to_date")
    private LocalDate toDate;

    // number of days requested (can be computed but store for convenience)
    @Column(name = "days_requested")
    private BigDecimal daysRequested;

    // if partial days supported (morning/afternoon)
    @Column(name = "partial_day_info")
    private String partialDayInfo; // e.g., "2025-08-01:HALF_MORNING"

    @Column(name = "reason")
    private String reason;

    // status workflow
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    // who currently is the approver (user id) - optional
    @Column(name = "current_approver_user_id")
    private Long currentApproverUserId;

    // total approved days (could be less than requested if partial approval)
    @Column(name = "days_approved")
    private BigDecimal daysApproved;

    // references for auditing / payroll
    @Column(name = "created_by_user_id")
    private Long createdByUserId;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_by_user_id")
    private Long updatedByUserId;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "admin_notes")
    private String adminNotes;
}
