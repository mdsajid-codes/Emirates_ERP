package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.enums.TripPaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trip_payment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private TripPaymentStatus paymentStatus = TripPaymentStatus.PENDING;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "received_by")
    private String receivedBy;              // Who collected the payment

    @Column(name = "token_payment_method", length = 30)
    private String tokenPaymentMethod;      // CASH, CARD, BANK_TRANSFER

    @Column(name = "cheque_number")
    private String chequeNumber;

    @Column(name = "other_reference")
    private String otherReference;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
