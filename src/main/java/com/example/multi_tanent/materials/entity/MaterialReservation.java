package com.example.multi_tanent.materials.entity;

import com.example.multi_tanent.materials.enums.ReserveStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "material_reservation")
public class MaterialReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "reservation_no", unique = true, nullable = false)
    private String reservationNo;

    @Column(name = "reservation_date")
    private LocalDate reservationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_requisition_id", nullable = false)
    private MaterialRequision materialRequisition;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private ReserveStatus status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @OneToMany(mappedBy = "materialReservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaterialReservationDetail> details;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
