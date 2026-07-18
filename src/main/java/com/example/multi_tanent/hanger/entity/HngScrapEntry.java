package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
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
@Table(name = "hng_scrap_entry")
public class HngScrapEntry {

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
    @JoinColumn(name = "wire_processing_id")
    private HngBatchWireProcessing wireProcessing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coating_log_id")
    private HngCoatingLog coatingLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qc_log_id")
    private HngQcLog qcLog;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 30)
    private ScrapStage stage;

    @Enumerated(EnumType.STRING)
    @Column(name = "scrap_type", nullable = false, length = 30)
    private ScrapType scrapType;

    @Column(name = "scrap_weight_kg", precision = 10, scale = 3)
    private BigDecimal scrapWeightKg;

    @Column(name = "rate_per_kg", precision = 10, scale = 2)
    private BigDecimal ratePerKg;

    @Column(name = "scrap_value", precision = 12, scale = 2)
    private BigDecimal scrapValue;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
