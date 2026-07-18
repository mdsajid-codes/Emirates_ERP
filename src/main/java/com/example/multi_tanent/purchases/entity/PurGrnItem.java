package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.production.entity.ProUnit;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "pur_grn_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurGrnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // owning GRN
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id", nullable = false)
    private PurGrn grn;

    // optional link to PO item for convenience
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_item_id")
    private PurPurchaseOrderItem purchaseOrderItem;

    @Column(name = "received_quantity", precision = 19, scale = 6)
    private BigDecimal receivedQuantity = BigDecimal.ZERO;

    @Column(name = "rate", precision = 19, scale = 4)
    private BigDecimal rate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProUnit unit;

    // --- QC / Rejection Handling Fields ---
    @Column(name = "accepted_quantity", precision = 19, scale = 6)
    private BigDecimal acceptedQuantity;

    @Column(name = "rejected_quantity", precision = 19, scale = 6)
    private BigDecimal rejectedQuantity;

    @Column(name = "rejection_reason", length = 2000)
    private String rejectionReason;
    // ---------------------------------------

    // --- Hanger Manufacturing ERP Phase 2 Fields ---
    @Column(name = "is_hanger_coil")
    private Boolean isHangerCoil = false;

    @Column(name = "heat_no")
    private String heatNo;

    @Column(name = "lot_no")
    private String lotNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_type", length = 20)
    private com.example.multi_tanent.hanger.enums.WireMaterialType materialType;

    @Column(name = "wire_gauge_mm", precision = 6, scale = 2)
    private BigDecimal wireGaugeMm;

    @Column(name = "gross_weight_kg", precision = 12, scale = 4)
    private BigDecimal grossWeightKg;

    @Column(name = "tare_weight_kg", precision = 12, scale = 4)
    private BigDecimal tareWeightKg;

    @Column(name = "net_weight_kg", precision = 12, scale = 4)
    private BigDecimal netWeightKg;

    @Column(name = "rate_per_kg", precision = 12, scale = 4)
    private BigDecimal ratePerKg;

    @Column(name = "total_value", precision = 14, scale = 4)
    private BigDecimal totalValue;

    @Column(name = "mill_certificate_url")
    private String millCertificateUrl;

    @Column(name = "warehouse_location")
    private String warehouseLocation;

    @Column(name = "coil_no")
    private String coilNo;

    @PrePersist
    @PreUpdate
    public void calculateNetWeightAndValue() {
        if (Boolean.TRUE.equals(isHangerCoil)) {
            if (grossWeightKg != null && tareWeightKg != null) {
                this.netWeightKg = grossWeightKg.subtract(tareWeightKg);
            }
            if (netWeightKg != null && ratePerKg != null) {
                this.totalValue = netWeightKg.multiply(ratePerKg);
            }
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurGrnItem))
            return false;
        PurGrnItem that = (PurGrnItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
