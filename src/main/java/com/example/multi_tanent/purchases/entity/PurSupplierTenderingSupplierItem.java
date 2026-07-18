package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pur_supplier_tendering_supplier_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingSupplierItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_supplier_id", nullable = false)
    private PurSupplierTenderingSupplier tenderingSupplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_item_id", nullable = false)
    private PurSupplierTenderingItem tenderingItem;

    @Column(name = "selected")
    private Boolean selected;
}
