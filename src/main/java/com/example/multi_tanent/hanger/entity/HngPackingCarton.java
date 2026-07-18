package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.SealStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hng_packing_carton")
public class HngPackingCarton {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "packing_id", nullable = false)
    private HngBatchPacking packing;

    @Column(name = "carton_no", nullable = false, length = 50)
    private String cartonNo;

    @Column(name = "bundles_in_carton")
    private Integer bundlesInCarton;

    @Column(name = "qty_in_carton")
    private Integer qtyInCarton;

    @Column(name = "gross_weight_kg", precision = 8, scale = 3)
    private BigDecimal grossWeightKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "seal_status", length = 20)
    private SealStatus sealStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
