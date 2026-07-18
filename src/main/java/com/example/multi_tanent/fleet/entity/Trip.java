package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import com.example.multi_tanent.fleet.entity.Vehicle;

@Entity
@Table(name = "trips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trip {
    
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // ── Identity ───────────────────────────────────────────────
    @Column(name = "trip_no", nullable = false)
    private Integer tripNo;                  // Auto-generated, sequential per tenant

    @Column(name = "trip_date", nullable = false)
    private LocalDate tripDate;

    @Column(name = "trip_month", length = 10)
    private String tripMonth;                // e.g. JAN, FEB

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "estimated_end_time")
    private LocalDateTime estimatedEndTime;

    // ── Driver (Fleet Driver) ─────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;                 // → fleet_drivers table

    // ── Container ──────────────────────────────────────────────
    @Column(name = "container_number", length = 20)
    private String containerNumber;

    @Column(name = "cargo_type", length = 30)
    private String cargoType;

    @Column(name = "load_weight_kg", precision = 10, scale = 2)
    private BigDecimal loadWeightKg;

    // ── Customer ───────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private TripCustomer customer;

    @Column(name = "customer_ref_job_no")
    private String customerRefJobNo;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "customer_type", length = 20)
    private String customerType;             // COMPANY or INDIVIDUAL

    // ── Route ──────────────────────────────────────────────────
    @Column(name = "from_location", nullable = false, length = 100)
    private String fromLocation;

    @Column(name = "to_location", nullable = false, length = 100)
    private String toLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    // ── Status ─────────────────────────────────────────────────
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "trip_status", length = 20)
    private TripStatus tripStatus = TripStatus.CREATED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    // ── Invoice Link ───────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private TripInvoice invoice;             // Set when invoice is generated

    // ── Related Tables (1:1) ────────────────────────────────────
    @Builder.Default
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TripStop> tripStops = new java.util.ArrayList<>();

    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TripCharges charges;             // Always present

    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TripPayment payment;             // Created when payment starts

    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TripVendorAssignment vendorAssignment; // Only if outsourced

    // ── Notes ──────────────────────────────────────────────────
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    // ── Audit ──────────────────────────────────────────────────
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
