package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fixed_asset_gl_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedAssetGLAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fixed_asset_gl_account_id")
    private Long id;

    @Column(name = "fixed_asset_id", nullable = false)
    private Long fixedAssetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_cost_account_id", nullable = false)
    private ChartOfAccount assetCostAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accum_depreciation_account_id")
    private ChartOfAccount accumDepreciationAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depreciation_expense_account_id")
    private ChartOfAccount depreciationExpenseAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
