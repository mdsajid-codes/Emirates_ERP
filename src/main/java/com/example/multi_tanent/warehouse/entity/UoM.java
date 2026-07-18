package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ware_uom")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UoM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, name = "short_name")
    private String shortName; // PCS, KG, BOX, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant enterprise;
}
