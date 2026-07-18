package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.CashFlowCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "acc_cash_flow_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccCashFlowItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private CashFlowCategory category;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_inflow")
    private Boolean isInflow;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;
}
