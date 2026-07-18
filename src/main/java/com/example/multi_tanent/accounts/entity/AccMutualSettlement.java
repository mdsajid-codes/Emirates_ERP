package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.SettlementStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "acc_mutual_settlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccMutualSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "settlement_number", nullable = false, unique = true, length = 50)
    private String settlementNumber;

    @Column(name = "settlement_date", nullable = false)
    private LocalDate settlementDate;

    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

    @Column(name = "partner_name", length = 255)
    private String partnerName;

    @Column(name = "currency_id")
    private Long currencyId;

    @Column(name = "settlement_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal settlementAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private SettlementStatus status = SettlementStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private com.example.multi_tanent.accounts.entity.journal.JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_entry_id")
    private com.example.multi_tanent.accounts.entity.journal.JournalEntry reversalEntry;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @OneToMany(mappedBy = "settlement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AccMutualSettlementApLine> apLines = new ArrayList<>();

    @OneToMany(mappedBy = "settlement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AccMutualSettlementArLine> arLines = new ArrayList<>();

    public void addApLine(AccMutualSettlementApLine line) {
        apLines.add(line);
        line.setSettlement(this);
    }

    public void addArLine(AccMutualSettlementArLine line) {
        arLines.add(line);
        line.setSettlement(this);
    }
}
