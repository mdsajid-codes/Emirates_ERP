package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.QcResult;
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
@Table(name = "hng_qc_log", uniqueConstraints = @UniqueConstraint(name = "uk_hng_qc_log_no", columnNames = "qc_log_no"))
public class HngQcLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private HngProductionBatch batch;

    @Column(name = "qc_log_no", nullable = false, length = 50)
    private String qcLogNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id")
    private Employee inspector;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @Column(name = "inspected_qty")
    private Integer inspectedQty;

    @Column(name = "passed_qty")
    private Integer passedQty;

    @Column(name = "rejected_qty")
    private Integer rejectedQty;

    @Column(name = "rework_qty")
    private Integer reworkQty;

    @Column(name = "defect_type", length = 100)
    private String defectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "qc_result", nullable = false, length = 20)
    private QcResult qcResult;

    @Column(name = "defect_pct", precision = 5, scale = 2)
    private BigDecimal defectPct;

    @Column(name = "load_test_passed")
    private Boolean loadTestPassed;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(name = "scrap_reason_code", length = 30)
    private com.example.multi_tanent.hanger.enums.ScrapReasonCode scrapReasonCode;

    @Column(name = "material_weight_lost", precision = 10, scale = 3)
    private BigDecimal materialWeightLost;

    @Column(name = "test_type", length = 100)
    private String testType;

    @Column(name = "measured_value", precision = 10, scale = 3)
    private BigDecimal measuredValue;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
