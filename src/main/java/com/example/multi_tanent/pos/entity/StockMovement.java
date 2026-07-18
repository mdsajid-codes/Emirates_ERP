package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @Column(name = "change_quantity")
    private Long changeQuantity; // positive incoming, negative outgoing

    @Column(name = "reason")
    private String reason; // sale, purchase, adjustment, return, reservation

    @ManyToOne
    @JoinColumn(name = "related_sale_id")
    private Sale relatedSale;

    @ManyToOne
    @JoinColumn(name = "related_purchase_id")
    private PurchaseOrder relatedPurchase;

    @Column(name = "batch_code")
    private String batchCode;

    @Column(name = "expire_date")
    private OffsetDateTime expireDate;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
    }
}