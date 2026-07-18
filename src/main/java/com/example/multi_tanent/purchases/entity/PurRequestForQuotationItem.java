package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pur_request_for_quotation_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRequestForQuotationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private PurRequestForQuotation rfq;

    @Column(name = "tendering_item_id")
    private Long tenderingItemId;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "quantity", precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "uom", length = 50)
    private String uom;
}
