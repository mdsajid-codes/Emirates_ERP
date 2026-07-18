package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.warehouse.enums.RackType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wms_rack", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "zone_id", "rackCode" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(nullable = false, name = "rack_code")
    private String rackCode; // ex: RACK-A1

    // ✅ Scanning support
    @Column(name = "barcode_tag")
    private String barcodeTag;

    @Column(name = "barcode_image_url")
    private String barcodeImageUrl;

    // ✅ rack classification
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "rack_type")
    @Builder.Default
    private RackType rackType = RackType.STORAGE;

    // ✅ route optimization (optional)
    @Column(name = "aisle")
    private String aisle; // Aisle number/name
    @Column(name = "pick_sequence")
    private Integer pickSequence; // smaller = picked first

    // ✅ capacities (optional)
    @Column(name = "max_weight")
    private Double maxWeight;
    @Column(name = "max_volume")
    private Double maxVolume;

    // ✅ active flag (never delete racks normally)
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "rack", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shelf> shelves = new ArrayList<>();
}
