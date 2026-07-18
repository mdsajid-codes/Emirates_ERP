package com.example.multi_tanent.hanger.entity;

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
@Table(name = "hng_job_card", uniqueConstraints = @UniqueConstraint(name = "uk_hng_job_card_no", columnNames = "job_card_no"))
public class HngJobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private HngProductionBatch batch;

    @Column(name = "job_card_no", nullable = false, length = 50)
    private String jobCardNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workstation_id")
    private com.example.multi_tanent.production.entity.ProWorkStation workstation;

    @Column(name = "tool_die_no", length = 100)
    private String toolDieNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private Employee operator;

    @Column(name = "shift", length = 20)
    private String shift;

    @Column(name = "planned_qty")
    private Integer plannedQty;

    @Column(name = "target_qty")
    private Integer targetQty;

    @Column(name = "produced_qty")
    private Integer producedQty;

    @Column(name = "rejected_qty")
    private Integer rejectedQty;

    @Column(name = "rework_qty")
    private Integer reworkQty;

    @Column(name = "labor_hours", precision = 6, scale = 2)
    private BigDecimal laborHours;

    @Column(name = "workstation_run_hours", precision = 6, scale = 2)
    private BigDecimal workstationRunHours;

    @Column(name = "breakdown_time", precision = 6, scale = 2)
    private BigDecimal breakdownTime;

    @Column(name = "cycle_time_sec", precision = 8, scale = 2)
    private BigDecimal cycleTimeSec;

    @Column(name = "availability_pct", precision = 5, scale = 2)
    private BigDecimal availabilityPct;

    @Column(name = "performance_pct", precision = 5, scale = 2)
    private BigDecimal performancePct;

    @Column(name = "quality_pct", precision = 5, scale = 2)
    private BigDecimal qualityPct;

    @Column(name = "oee_pct", precision = 5, scale = 2)
    private BigDecimal oeePct;

    @Column(name = "actual_shoulder_width_mm", precision = 6, scale = 2)
    private BigDecimal actualShoulderWidthMm;

    @Column(name = "actual_hook_size_mm", precision = 6, scale = 2)
    private BigDecimal actualHookSizeMm;

    @Column(name = "dimension_pass")
    private Boolean dimensionPass;

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
