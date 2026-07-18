package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.CashEquivStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "acc_cash_equivalents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccCashEquivalent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id")
    private AccBankAccount bankAccount;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "investment_date", nullable = false)
    private LocalDate investmentDate;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gl_account_id", nullable = false)
    private com.example.multi_tanent.accounts.entity.coa.ChartOfAccount glAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @Builder.Default
    private CashEquivStatus status = CashEquivStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private com.example.multi_tanent.accounts.entity.journal.JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maturity_journal_id")
    private com.example.multi_tanent.accounts.entity.journal.JournalEntry maturityJournal;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;
}
