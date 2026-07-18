package com.example.multi_tanent.materials.entity;

import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProProcess;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "material_issue_detail")
public class MaterialIssueDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_issue_id", nullable = false)
    private MaterialIssue materialIssue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private ProProcess process;

    @Column(name = "issued_quantity")
    private BigDecimal issuedQuantity;

    // Hanger Phase 3 fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coil_ref_id")
    private com.example.multi_tanent.hanger.entity.HngCoilStock coilRef;

    @Column(name = "issued_weight_kg", precision = 12, scale = 4)
    private BigDecimal issuedWeightKg;
}
