package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bank_reconciliations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"matches"})
public class BankReconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reconciliation_id")
    private Long id;

    @Column(name = "bank_account_id", nullable = false)
    private Long bankAccountId;

    @Column(name = "statement_date", nullable = false)
    private LocalDate statementDate;

    @Column(name = "statement_opening_balance", precision = 19, scale = 2)
    private BigDecimal statementOpeningBalance;

    @Column(name = "statement_closing_balance", precision = 19, scale = 2)
    private BigDecimal statementClosingBalance;

    @Column(name = "cleared_balance", precision = 19, scale = 2)
    private BigDecimal clearedBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReconciliationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Builder.Default
    @OneToMany(mappedBy = "reconciliation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BankReconciliationMatch> matches = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ReconciliationStatus {
        DRAFT,
        RECONCILED
    }
}
