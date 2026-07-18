package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "party_gl_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyGLAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "party_gl_account_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", nullable = false, length = 20)
    private PartyType partyType;

    @Column(name = "party_id", nullable = false)
    private Long partyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accounts_receivable_id")
    private ChartOfAccount accountsReceivable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accounts_payable_id")
    private ChartOfAccount accountsPayable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advances_received_id")
    private ChartOfAccount advancesReceived;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advances_paid_id")
    private ChartOfAccount advancesPaid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pdcs_received_id")
    private ChartOfAccount pdcsReceived;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pdcs_issued_id")
    private ChartOfAccount pdcsIssued;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_assets_id")
    private ChartOfAccount contractAssets;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retention_receivables_id")
    private ChartOfAccount retentionReceivables;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retention_payables_id")
    private ChartOfAccount retentionPayables;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retention_output_vat_id")
    private ChartOfAccount retentionOutputVat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retention_input_vat_id")
    private ChartOfAccount retentionInputVat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unbilled_purchases_id")
    private ChartOfAccount unbilledPurchases;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advance_to_receive_id")
    private ChartOfAccount advanceToReceive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
