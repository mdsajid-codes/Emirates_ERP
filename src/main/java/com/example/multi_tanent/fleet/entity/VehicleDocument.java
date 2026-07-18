package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.enums.VehicleDocumentType;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fleet_vehicle_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private VehicleDocumentType documentType;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "uploaded_at", nullable = false)
    private OffsetDateTime uploadedAt;
}
