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
@Table(name = "material_indent_detail")
public class MaterialIndentDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_indent_id", nullable = false)
    private MaterialIndent materialIndent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private ProProcess process;

    @Column(name = "indent_quantity")
    private BigDecimal indentQuantity;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "additional_description", columnDefinition = "TEXT")
    private String additionalDescription;
}
