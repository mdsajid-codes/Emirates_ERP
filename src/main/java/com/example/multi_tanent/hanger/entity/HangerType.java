package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Master data for each hanger type.
 * Defines standard dimensions, QC tolerances, and production parameters.
 * Used across all hanger production stages for validation and auto-calculation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hng_hanger_types", uniqueConstraints = @UniqueConstraint(name = "uk_hng_hanger_type_tenant", columnNames = {
        "tenant_id", "type_name" }))
public class HangerType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /** Hanger category: ADULT / CHILD / HEAVY_DUTY */
    @Enumerated(EnumType.STRING)
    @Column(name = "type_name", nullable = false, length = 20)
    private HangerTypeEnum typeName;

    /**
     * Weight of one hanger in grams — used to auto-calculate required wire per
     * batch
     */
    @Column(name = "unit_weight_grams", nullable = false, precision = 10, scale = 4)
    private BigDecimal unitWeightGrams;

    /** Standard shoulder width in cm (e.g., 42 cm for adult) */
    @Column(name = "standard_width_cm", nullable = false, precision = 8, scale = 2)
    private BigDecimal standardWidthCm;

    /** Standard hook size in cm (e.g., 4.5 cm) */
    @Column(name = "standard_hook_cm", nullable = false, precision = 8, scale = 2)
    private BigDecimal standardHookCm;

    /** Acceptable deviation from standard dimensions in mm */
    @Column(name = "tolerance_mm", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal toleranceMm = BigDecimal.ONE;

    /** Maximum allowable defect % in QC before batch is rejected (e.g., 2.0%) */
    @Column(name = "max_defect_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxDefectPct = new BigDecimal("2.00");

    /** Minimum sample size for QC inspection */
    @Column(name = "min_qc_sample_size")
    @Builder.Default
    private Integer minQcSampleSize = 300;

    /** Default bundle size for packing (e.g., 100 pcs per bundle) */
    @Column(name = "default_bundle_size")
    @Builder.Default
    private Integer defaultBundleSize = 100;

    /** Minimum load test weight in Kg (e.g., 3 Kg for adult) */
    @Column(name = "min_load_test_kg", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal minLoadTestKg = new BigDecimal("3.00");

    /** Wire gauge commonly used for this hanger type in mm */
    @Column(name = "standard_wire_gauge_mm", precision = 6, scale = 2)
    private BigDecimal standardWireGaugeMm;

    /** Standard cycle time per piece in seconds */
    @Column(name = "standard_cycle_time_sec", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal standardCycleTimeSec = new BigDecimal("2.50");

    /** Acceptable deviation for shoulder width in mm */
    @Column(name = "shoulder_width_tolerance_mm", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal shoulderWidthToleranceMm = new BigDecimal("2.00");

    /** Acceptable deviation for hook size in mm */
    @Column(name = "hook_size_tolerance_mm", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal hookSizeToleranceMm = new BigDecimal("1.00");

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crm_sales_product_id")
    private CrmSalesProduct crmSalesProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pro_finished_good_id")
    private ProFinishedGood finishedGood;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
