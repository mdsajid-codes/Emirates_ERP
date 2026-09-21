package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pos_settlements")
public class PosSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "settlement_ref")
    private String settlementRef;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "gross_amount_cents")
    private Long grossAmountCents = 0L;

    @Column(name = "merchant_fee_cents")
    private Long merchantFeeCents = 0L;

    @Column(name = "net_amount_cents")
    private Long netAmountCents = 0L;

    @Column(name = "bank_account_id")
    private Long bankAccountId;

    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public PosSettlement() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getSettlementRef() {
        return settlementRef;
    }

    public void setSettlementRef(String settlementRef) {
        this.settlementRef = settlementRef;
    }

    public LocalDateTime getSettledAt() {
        return settledAt;
    }

    public void setSettledAt(LocalDateTime settledAt) {
        this.settledAt = settledAt;
    }

    public Long getGrossAmountCents() {
        return grossAmountCents;
    }

    public void setGrossAmountCents(Long grossAmountCents) {
        this.grossAmountCents = grossAmountCents;
    }

    public Long getMerchantFeeCents() {
        return merchantFeeCents;
    }

    public void setMerchantFeeCents(Long merchantFeeCents) {
        this.merchantFeeCents = merchantFeeCents;
    }

    public Long getNetAmountCents() {
        return netAmountCents;
    }

    public void setNetAmountCents(Long netAmountCents) {
        this.netAmountCents = netAmountCents;
    }

    public Long getBankAccountId() {
        return bankAccountId;
    }

    public void setBankAccountId(Long bankAccountId) {
        this.bankAccountId = bankAccountId;
    }

    public Long getJournalEntryId() {
        return journalEntryId;
    }

    public void setJournalEntryId(Long journalEntryId) {
        this.journalEntryId = journalEntryId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
