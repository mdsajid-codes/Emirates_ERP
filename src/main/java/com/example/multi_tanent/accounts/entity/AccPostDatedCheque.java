package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.PdcStatus;
import com.example.multi_tanent.accounts.entity.enums.PdcType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_post_dated_cheques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccPostDatedCheque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "pdc_type", nullable = false, length = 50)
    private PdcType pdcType;

    @Column(name = "cheque_number", nullable = false, length = 100)
    private String chequeNumber;

    @Column(name = "cheque_date", nullable = false)
    private LocalDate chequeDate;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency_id")
    private Long currencyId;

    @Column(name = "bank_name", length = 200)
    private String bankName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id")
    private AccBankAccount bankAccount;

    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

    @Column(name = "partner_type", length = 50)
    private String partnerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PdcStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private AccPayment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step1_journal_entry_id")
    private com.example.multi_tanent.accounts.entity.journal.JournalEntry step1JournalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step2_journal_entry_id")
    private com.example.multi_tanent.accounts.entity.journal.JournalEntry step2JournalEntry;

    @Column(name = "bank_charges", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal bankCharges = BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;
}
