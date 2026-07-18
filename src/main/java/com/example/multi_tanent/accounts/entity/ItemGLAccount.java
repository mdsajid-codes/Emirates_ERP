package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_gl_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemGLAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_gl_account_id")
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gl_account_id")
    private ChartOfAccount glAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goods_on_consignment_account_id")
    private ChartOfAccount goodsOnConsignmentAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_revenue_account_id")
    private ChartOfAccount salesRevenueAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_discounts_account_id")
    private ChartOfAccount tradeDiscountsAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_of_goods_sold_account_id")
    private ChartOfAccount costOfGoodsSoldAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deferred_expenses_account_id")
    private ChartOfAccount deferredExpensesAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "output_vat_account_id")
    private ChartOfAccount outputVatAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "input_vat_account_id")
    private ChartOfAccount inputVatAccount;

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
