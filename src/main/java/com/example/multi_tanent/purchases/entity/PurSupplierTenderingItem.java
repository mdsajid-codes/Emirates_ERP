package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pur_supplier_tendering_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "content", length = 1000)
    private String content;

    @Column(name = "quantity", precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "uom", length = 50)
    private String uom;
}
