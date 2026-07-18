package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.production.entity.ProWorkStation;
import com.example.multi_tanent.spersusers.enitity.Employee;
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
@Table(name = "hng_batch_wire_processing")
public class HngBatchWireProcessing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private HngProductionBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_station_id")
    private ProWorkStation workStation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private Employee operator;

    @Column(name = "shift", length = 20)
    private String shift;

    @Column(name = "cost_center", length = 100)
    private String costCenter;

    @Column(name = "cutting_length_cm", precision = 8, scale = 2)
    private BigDecimal cuttingLengthCm;

    @Column(name = "planned_qty")
    private Integer plannedQty;

    @Column(name = "produced_qty")
    private Integer producedQty;

    @Column(name = "scrap_qty")
    private Integer scrapQty;

    @Column(name = "scrap_weight_kg", precision = 10, scale = 3)
    private BigDecimal scrapWeightKg;

    @Column(name = "scrap_pct", precision = 5, scale = 2)
    private BigDecimal scrapPct;

    @Column(name = "productivity_pcs_per_hour", precision = 8, scale = 2)
    private BigDecimal productivityPcsPerHour;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
