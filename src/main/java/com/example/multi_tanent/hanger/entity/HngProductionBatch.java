package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.BatchStatus;
import com.example.multi_tanent.production.entity.ManufacturingOrder;
import com.example.multi_tanent.production.entity.ProWorkStation;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hng_production_batch", uniqueConstraints = @UniqueConstraint(name = "uk_hng_batch_no", columnNames = "batch_no"))
public class HngProductionBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "batch_no", nullable = false, length = 50)
    private String batchNo;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "mo_id", nullable = false)
    private ManufacturingOrder mo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coil_ref_id")
    private HngCoilStock coilStock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hanger_type_id")
    private HangerType hangerType;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "planned_qty", nullable = false)
    private Integer plannedQty;

    @Column(name = "shift", length = 20)
    private String shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_station_id")
    private ProWorkStation workStation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private BatchStatus status = BatchStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false, length = 30)
    @Builder.Default
    private BatchStage currentStage = BatchStage.WIRE_CUTTING;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "actual_qty")
    private Integer actualQty;

    @Column(name = "actual_wire_used_kg", precision = 12, scale = 4)
    private java.math.BigDecimal actualWireUsedKg;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
