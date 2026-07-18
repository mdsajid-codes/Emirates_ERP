package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.warehouse.enums.BinType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wms_bin", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "warehouse_id", "binCode" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ keep shelf relation (physical hierarchy)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shelf_id", nullable = false)
    private Shelf shelf;

    // ✅ add direct warehouse relation for fast queries + correct uniqueness
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WareHouse warehouse;

    @Column(nullable = false, name = "bin_code")
    private String binCode; // ex: A1-R1-S1-B01

    @Column(name = "barcode_tag")
    private String barcodeTag;

    @Column(name = "barcode_image_url")
    private String barcodeImageUrl;

    // ✅ Bin type (important for system default bins)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "bin_type")
    @Builder.Default
    private BinType binType = BinType.STORAGE;

    // ✅ capacity limits
    @Column(name = "capacity_qty")
    private Integer capacityQty;

    @Column(name = "capacity_weight")
    private Double capacityWeight;

    @Column(name = "capacity_volume")
    private Double capacityVolume;

    // ✅ operational controls
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_blocked")
    private Boolean blocked = false;

    @Column(name = "block_reason")
    private String blockReason;

    // ✅ optimize picking
    @Column(name = "pick_sequence")
    private Integer pickSequence;

    // ✅ safety constraints (optional)
    @Builder.Default
    @Column(name = "hazardous_allowed")
    private Boolean hazardousAllowed = false;

    @Column(name = "min_temp")
    private Double minTemp;

    @Column(name = "max_temp")
    private Double maxTemp;

    private String description;
}
