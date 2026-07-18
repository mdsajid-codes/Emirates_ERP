package com.example.multi_tanent.accounts.entity.journal;

import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;
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
@Table(name = "journal_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"lines"})
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(name = "entry_number", unique = true, nullable = false, length = 50)
    private String entryNumber;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType documentType;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "company_id")
    private Long companyId; // Nullable for Phase 1, linked to company table in Phase 2

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "total_debit", precision = 19, scale = 2)
    private BigDecimal totalDebit;

    @Column(name = "total_credit", precision = 19, scale = 2)
    private BigDecimal totalCredit;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JournalEntryStatus status = JournalEntryStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversed_by_id")
    private JournalEntry reversedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_of_id")
    private JournalEntry reversalOf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_invoice_je_id")
    private JournalEntry linkedInvoice;

    @Column(name = "posted_date")
    private LocalDateTime postedDate;

    @Column(name = "posted_by", length = 100)
    private String postedBy;

    @Column(name = "tenant_id")
    private Long tenantId; // Isolated simple tenant link for JournalEntry

    @Builder.Default
    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "AED";

    @Builder.Default
    @Column(name = "exchange_rate", nullable = false, precision = 18, scale = 6)
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<JournalEntryLine> lines = new ArrayList<>();

    public void addLine(JournalEntryLine line) {
        lines.add(line);
        line.setJournalEntry(this);
    }

    public void removeLine(JournalEntryLine line) {
        lines.remove(line);
        line.setJournalEntry(null);
    }
}
