package com.example.multi_tanent.materials.entity;

import com.example.multi_tanent.production.entity.ProRawMaterials;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "material_reservation_detail")
public class MaterialReservationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_reservation_id", nullable = false)
    private MaterialReservation materialReservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private com.example.multi_tanent.production.entity.ProProcess process;

    @Column(name = "reserved_quantity")
    private BigDecimal reservedQuantity;
}
