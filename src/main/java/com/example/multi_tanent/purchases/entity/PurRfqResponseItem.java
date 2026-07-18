package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pur_rfq_response_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private PurRfqResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_item_id", nullable = false)
    private PurSupplierTenderingItem tenderingItem;

    @Column(name = "price", precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "comment", length = 1000)
    private String comment;
}
