package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.enums.OtherChargeType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trip_charges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripCharges {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Strict 1:1 — one charge record per trip
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;              // Base trip rate

    @Column(name = "token_amount", precision = 10, scale = 2)
    private BigDecimal tokenAmount;         // Advance/deposit — 0% VAT

    @Column(name = "other_charges", precision = 10, scale = 2)
    private BigDecimal otherCharges;        // Inspection / Waiting / Commission

    @Enumerated(EnumType.STRING)
    @Column(name = "other_charge_type", length = 30)
    private OtherChargeType otherChargeType;

    // ── CALCULATED FIELDS — Always set by service, never by frontend ──
    @Column(name = "vat_amount", precision = 10, scale = 2)
    private BigDecimal vatAmount;           // = (amount + otherCharges) × 0.05

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;         // = amount + vatAmount + otherCharges + tokenAmount

    @Column(name = "driver_commission", precision = 10, scale = 2)
    private BigDecimal driverCommission;    // = amount × 0.10

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
