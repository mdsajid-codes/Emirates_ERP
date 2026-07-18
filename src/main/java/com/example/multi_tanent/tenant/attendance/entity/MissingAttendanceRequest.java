package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.tenant.attendance.enums.MissingAttendanceRequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "missing_attendance_requests")
@Data
public class MissingAttendanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, name = "attendance_date")
    private LocalDate attendanceDate;

    @Column(name = "requested_check_in")
    private LocalTime requestedCheckIn;
    @Column(name = "requested_check_out")
    private LocalTime requestedCheckOut;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, name = "status")
    private MissingAttendanceRequestStatus status;

    @CreationTimestamp
    @Column(name = "request_date")
    private LocalDateTime requestDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(length = 500, name = "approver_remarks")
    private String approverRemarks;

    @Column(name = "attachment_path")
    private String attachmentPath; // Path to the uploaded supporting document
}
