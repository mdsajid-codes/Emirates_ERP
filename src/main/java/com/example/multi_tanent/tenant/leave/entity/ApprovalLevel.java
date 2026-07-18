package com.example.multi_tanent.tenant.leave.entity;

import com.example.multi_tanent.tenant.leave.enums.ApproverSelectionMode;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "approval_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_policy_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private LeaveTypePolicy leaveTypePolicy;

    /** 1..N order */
    @Column(name = "level_order")
    private int levelOrder;

    @Enumerated(EnumType.STRING)
    @Column(length = 32, name = "selection_mode")
    private ApproverSelectionMode selectionMode; // ROLE_BASED / NAMED_EMPLOYEES

    /** When ROLE_BASED store a code like REPORTING_MANAGER/HR_MANAGER, etc. */
    @Column(name = "role_key")
    private String roleKey;

    /**
     * When NAMED_EMPLOYEES, store specific user id (or model a join table if many)
     */
    @Column(name = "employee_id")
    private Long employeeId;
}