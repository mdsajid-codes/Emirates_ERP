package com.example.multi_tanent.pos.entity;

import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sale_items")
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    private Sale sale;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private CrmSalesProduct product;

    @Column(name = "cost_cents")
    private Long costCents;

    @Column(name = "quantity")
    private Long quantity;

    @Column(name = "unit_price_cents")
    private Long unitPriceCents;

    @Column(name = "line_total_cents")
    private Long lineTotalCents;

    @Column(name = "tax_cents")
    private Long taxCents;

    @Column(name = "discount_cents")
    private Long discountCents = 0L;
}