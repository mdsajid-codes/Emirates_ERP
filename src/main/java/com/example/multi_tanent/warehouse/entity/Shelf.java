package com.example.multi_tanent.warehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wms_shelf", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "rack_id", "shelfCode" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shelf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "rack_id", nullable = false)
    private Rack rack;

    @Column(nullable = false, name = "shelf_code")
    private String shelfCode; // example: S1, S2, TOP

    // ✅ Scan support
    @Column(name = "barcode_tag")
    private String barcodeTag;

    @Column(name = "barcode_image_url")
    private String barcodeImageUrl;

    // ✅ physical position (helpful for picking optimization)
    @Column(nullable = false, name = "level_no")
    private Integer levelNo; // 0,1,2...

    @Column(name = "pick_sequence")
    private Integer pickSequence; // smaller = pick first

    // ✅ capacity constraints
    @Column(name = "max_weight")
    private Double maxWeight;

    @Column(name = "max_volume")
    private Double maxVolume;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "shelf", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bin> bins = new ArrayList<>();
}
