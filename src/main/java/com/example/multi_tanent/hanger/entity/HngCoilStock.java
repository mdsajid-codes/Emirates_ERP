package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.enums.WireMaterialType;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Tracks each individual physical steel wire coil.
 * Created automatically when a GRN item is approved for this coil material.
 * The remainingWeightKg is decremented on every Material Issue to production.
 *
 * This is the core of Coil Balance Tracking — the "smart control" the client
 * requires.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hng_coil_stock", uniqueConstraints = @UniqueConstraint(name = "uk_hng_coil_no", columnNames = "coil_no"))
public class HngCoilStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /** Auto-generated coil identifier, e.g., COIL-2024-001 */
    @Column(name = "coil_no", nullable = false, length = 50)
    private String coilNo;

    /** Reference to the PurGrnItem row this coil was created from */
    @Column(name = "grn_item_id")
    private Long grnItemId;

    /** Supplier lot / batch number */
    @Column(name = "lot_no", length = 100)
    private String lotNo;

    /** Furnace heat number — metal industry traceability field */
    @Column(name = "heat_no", length = 100)
    private String heatNo;

    /** Supplier name — copied from GRN for quick reference */
    @Column(name = "supplier_name", length = 255)
    private String supplierName;

    /** Wire material type: MS / GALVANIZED / SS */
    @Enumerated(EnumType.STRING)
    @Column(name = "material_type", length = 20)
    private WireMaterialType materialType;

    /** Wire gauge in mm, e.g., 1.6 */
    @Column(name = "wire_gauge_mm", nullable = false, precision = 6, scale = 2)
    private BigDecimal wireGaugeMm;

    /** Total net weight of this coil in Kg (gross - tare from GRN) */
    @Column(name = "total_weight_kg", nullable = false, precision = 12, scale = 4)
    private BigDecimal totalWeightKg;

    /**
     * Remaining usable weight — updated on every Material Issue.
     * When this reaches 0, status becomes EXHAUSTED.
     */
    @Column(name = "remaining_weight_kg", nullable = false, precision = 12, scale = 4)
    private BigDecimal remainingWeightKg;

    /** Purchase rate per Kg — from GRN, used for production cost sheet */
    @Column(name = "rate_per_kg", precision = 12, scale = 4)
    private BigDecimal ratePerKg;

    /** Physical warehouse location (bin/rack/zone) */
    @Column(name = "warehouse_location", length = 200)
    private String warehouseLocation;

    /** QC result from GRN inspection */
    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_status", length = 20)
    @Builder.Default
    private CoilInspectionStatus inspectionStatus = CoilInspectionStatus.PENDING;

    /** Current availability status — auto-managed by service layer */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private CoilStatus status = CoilStatus.AVAILABLE;

    /** Barcode/QR code string for shop floor scanning */
    @Column(name = "barcode_qr", length = 500)
    private String barcodeQr;

    /** URL to scanned/uploaded Mill Quality Certificate */
    @Column(name = "mill_certificate_url", length = 500)
    private String millCertificateUrl;

    /** Date the coil was received (from GRN date) */
    @Column(name = "received_date")
    private LocalDate receivedDate;

    /** Inspector remarks from GRN quality check */
    @Column(name = "qc_remarks", columnDefinition = "TEXT")
    private String qcRemarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /**
     * Deducts issuedWeight from remaining and updates status.
     * Called by MaterialIssueService when wire is issued to a batch.
     */
    public void issueWeight(BigDecimal issuedWeightKg) {
        this.remainingWeightKg = this.remainingWeightKg.subtract(issuedWeightKg);
        if (this.remainingWeightKg.compareTo(BigDecimal.ZERO) <= 0) {
            this.remainingWeightKg = BigDecimal.ZERO;
            this.status = CoilStatus.EXHAUSTED;
        } else {
            this.status = CoilStatus.PARTIAL;
        }
    }
}
