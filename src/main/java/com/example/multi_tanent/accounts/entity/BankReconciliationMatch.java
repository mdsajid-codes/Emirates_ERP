package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bank_reconciliation_matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankReconciliationMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciliation_id", nullable = false)
    private BankReconciliation reconciliation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_line_id", nullable = false)
    private JournalEntryLine journalEntryLine;

    @Column(name = "is_cleared", nullable = false)
    private Boolean isCleared;

    @CreationTimestamp
    @Column(name = "cleared_at", updatable = false)
    private LocalDateTime clearedAt;
}
