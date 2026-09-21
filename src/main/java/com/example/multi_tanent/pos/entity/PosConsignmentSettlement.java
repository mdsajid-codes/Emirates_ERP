package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pos_consignment_settlements")
public class PosConsignmentSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "vendor_id")
    private Long vendorId;

    @Column(name = "sale_id")
    private Long saleId;

    @Column(name = "vendor_payout_cents")
    private Long vendorPayoutCents = 0L;

    @Column(name = "store_commission_cents")
    private Long storeCommissionCents = 0L;

    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public PosConsignmentSettlement() {}

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

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public Long getVendorPayoutCents() {
        return vendorPayoutCents;
    }

    public void setVendorPayoutCents(Long vendorPayoutCents) {
        this.vendorPayoutCents = vendorPayoutCents;
    }

    public Long getStoreCommissionCents() {
        return storeCommissionCents;
    }

    public void setStoreCommissionCents(Long storeCommissionCents) {
        this.storeCommissionCents = storeCommissionCents;
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
