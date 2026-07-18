package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.enums.TripPaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trip_vendor_assignment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripVendorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private TripVendor vendor;

    @Column(name = "vendor_amount", precision = 10, scale = 2)
    private BigDecimal vendorAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "vendor_payment_status", length = 20)
    private TripPaymentStatus vendorPaymentStatus = TripPaymentStatus.PENDING;

    @Column(name = "vendor_payment_date")
    private LocalDate vendorPaymentDate;

    @Column(name = "vendor_notes", columnDefinition = "TEXT")
    private String vendorNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
