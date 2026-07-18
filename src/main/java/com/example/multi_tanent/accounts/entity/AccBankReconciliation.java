package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.ReconciliationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "acc_bank_reconciliations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccBankReconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private AccBankAccount bankAccount;

    @Column(name = "statement_date", nullable = false)
    private LocalDate statementDate;

    @Column(name = "statement_balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal statementBalance;

    @Column(name = "gl_balance", precision = 18, scale = 2)
    private BigDecimal glBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @Builder.Default
    private ReconciliationStatus status = ReconciliationStatus.DRAFT;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @OneToMany(mappedBy = "reconciliation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AccBankStatementLine> lines = new ArrayList<>();

    public void addLine(AccBankStatementLine line) {
        lines.add(line);
        line.setReconciliation(this);
    }

    public void removeLine(AccBankStatementLine line) {
        lines.remove(line);
        line.setReconciliation(null);
    }
}
