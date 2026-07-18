package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_gl_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeGLAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_gl_account_id")
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_payable_account_id")
    private ChartOfAccount salaryPayableAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advance_account_id")
    private ChartOfAccount advanceAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_account_id")
    private ChartOfAccount expenseAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
