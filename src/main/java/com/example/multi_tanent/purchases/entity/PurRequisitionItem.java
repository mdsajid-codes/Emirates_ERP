package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProUnit;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pur_requisition_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurRequisitionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id")
    private PurRequisition requisition;

    @Column(name = "line_number")
    private Integer lineNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProRawMaterials item;

    @Column(length = 2000)
    private String description;

    @Column(precision = 19, scale = 6)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProUnit unit;

    @Column(precision = 19, scale = 4)
    private BigDecimal rate;

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;
}
