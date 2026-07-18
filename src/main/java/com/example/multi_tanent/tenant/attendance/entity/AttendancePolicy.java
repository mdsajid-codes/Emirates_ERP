package com.example.multi_tanent.tenant.attendance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "attendance_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "policy_name")
    private String policyName;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_policy_id")
    private ShiftPolicy shiftPolicy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capturing_policy_id")
    private AttendanceCapturingPolicy capturingPolicy;

    @OneToOne(mappedBy = "policy", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private LeaveDeductionConfig leaveDeductionConfig;
}