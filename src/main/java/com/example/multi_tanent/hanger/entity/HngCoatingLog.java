package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.CoatingType;
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
@Table(name = "hng_coating_log", uniqueConstraints = @UniqueConstraint(name = "uk_hng_coating_log_no", columnNames = "coating_log_no"))
public class HngCoatingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private HngProductionBatch batch;

    @Column(name = "coating_log_no", nullable = false, length = 50)
    private String coatingLogNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "coating_type", nullable = false, length = 30)
    private CoatingType coatingType;

    @Column(name = "color_code", length = 50)
    private String colorCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workstation_id")
    private com.example.multi_tanent.production.entity.ProWorkStation workstation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private Employee operator;

    @Column(name = "shift", length = 20)
    private String shift;

    @Column(name = "input_qty")
    private Integer inputQty;

    @Column(name = "produced_qty")
    private Integer producedQty;

    @Column(name = "rejected_qty")
    private Integer rejectedQty;

    @Column(name = "rework_qty")
    private Integer reworkQty;

    @Column(name = "paint_consumed_kg", precision = 8, scale = 3)
    private BigDecimal paintConsumedKg;

    @Column(name = "chemical_batch", length = 100)
    private String chemicalBatch;

    @Column(name = "temperature_c", precision = 5, scale = 1)
    private BigDecimal temperatureC;

    @Column(name = "coating_thickness_mm", precision = 6, scale = 3)
    private BigDecimal coatingThicknessMm;

    @Column(name = "duration_min", precision = 6, scale = 1)
    private BigDecimal durationMin;

    @Column(name = "color_pass")
    private Boolean colorPass;

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
