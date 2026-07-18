package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.sales.enums.PodStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "proof_of_delivery")
@EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
public class ProofOfDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_order_id", nullable = false)
    private DeliveryOrder deliveryOrder;

    @Enumerated(EnumType.STRING)
    private PodStatus status;

    @Column(name = "signature_url", length = 500)
    private String signatureUrl;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "received_by_name")
    private String receivedByName;

    @Column(name = "received_by_phone", length = 50)
    private String receivedByPhone;

    @Column(name = "gps_latitude")
    private Double gpsLatitude;

    @Column(name = "gps_longitude")
    private Double gpsLongitude;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @Lob
    private String remarks;

    @Lob
    @Column(name = "rejection_reason")
    private String rejectionReason;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant enterprise;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
