package com.example.multi_tanent.accounts.entity.vat;

import com.example.multi_tanent.accounts.entity.enums.TaxPaymentType;
import com.example.multi_tanent.accounts.entity.enums.TaxTransactionType;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TaxTransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private TaxPaymentType paymentType;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
