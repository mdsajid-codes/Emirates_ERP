package com.example.multi_tanent.tenant.leave.entity;

import jakarta.persistence.*;
import lombok.*;

import com.example.multi_tanent.spersusers.enitity.Employee;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "leave_balances", uniqueConstraints = @UniqueConstraint(columnNames = { "employee_id", "leave_type_id",
        "year" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // employee
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "year")
    private Integer year; // financial or calendar year depending on policy

    @Column(name = "as_of_date")
    private LocalDate asOfDate;

    // Total allocated for this year (including carry forward applied)
    @Column(precision = 5, scale = 2, name = "total_allocated")
    private BigDecimal totalAllocated = BigDecimal.ZERO;

    // Already used (approved and taken)
    @Column(precision = 5, scale = 2, name = "used")
    private BigDecimal used = BigDecimal.ZERO;

    // Pending requests count towards pending but not yet deducted from used
    @Column(precision = 5, scale = 2, name = "pending")
    private BigDecimal pending = BigDecimal.ZERO;

    // convenience getter (not persisted) could be calculated in service
    @Transient
    public BigDecimal getAvailable() {
        BigDecimal allocated = this.totalAllocated == null ? BigDecimal.ZERO : this.totalAllocated;
        BigDecimal usedAmount = this.used == null ? BigDecimal.ZERO : this.used;
        BigDecimal pendingAmount = this.pending == null ? BigDecimal.ZERO : this.pending;
        return allocated.subtract(usedAmount).subtract(pendingAmount);
    }

    // audit
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    @Column(name = "updated_by_user_id")
    private Long updatedByUserId;
}
