package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pos_shifts")
public class PosShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "terminal_id")
    private String terminalId;

    @Column(name = "cashier_user_id")
    private String cashierUserId;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "opening_cash_cents")
    private Long openingCashCents = 0L;

    @Column(name = "expected_cash_cents")
    private Long expectedCashCents = 0L;

    @Column(name = "actual_cash_cents")
    private Long actualCashCents = 0L;

    @Column(name = "over_short_cents")
    private Long overShortCents = 0L;

    @Column(name = "status")
    private String status = "OPEN"; // OPEN, CLOSED, RECONCILED

    @Column(name = "z_report_journal_entry_id")
    private Long zReportJournalEntryId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public PosShift() {}

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

    public String getTerminalId() {
        return terminalId;
    }

    public void setTerminalId(String terminalId) {
        this.terminalId = terminalId;
    }

    public String getCashierUserId() {
        return cashierUserId;
    }

    public void setCashierUserId(String cashierUserId) {
        this.cashierUserId = cashierUserId;
    }

    public LocalDateTime getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(LocalDateTime openedAt) {
        this.openedAt = openedAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public Long getOpeningCashCents() {
        return openingCashCents;
    }

    public void setOpeningCashCents(Long openingCashCents) {
        this.openingCashCents = openingCashCents;
    }

    public Long getExpectedCashCents() {
        return expectedCashCents;
    }

    public void setExpectedCashCents(Long expectedCashCents) {
        this.expectedCashCents = expectedCashCents;
    }

    public Long getActualCashCents() {
        return actualCashCents;
    }

    public void setActualCashCents(Long actualCashCents) {
        this.actualCashCents = actualCashCents;
    }

    public Long getOverShortCents() {
        return overShortCents;
    }

    public void setOverShortCents(Long overShortCents) {
        this.overShortCents = overShortCents;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getZReportJournalEntryId() {
        return zReportJournalEntryId;
    }

    public void setZReportJournalEntryId(Long zReportJournalEntryId) {
        this.zReportJournalEntryId = zReportJournalEntryId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
