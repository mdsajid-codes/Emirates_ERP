package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.warehouse.enums.ZoneType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wms_zone", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "warehouse_id", "name" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WareHouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    private Floor floor;

    @Column(nullable = false)
    private String name;

    // ✅ Zone Type decides behavior in workflows
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "zone_type")
    @Builder.Default
    private ZoneType zoneType = ZoneType.STORAGE;

    // ✅ control pick / put-away optimization
    @Builder.Default
    @Column(name = "pick_priority")
    private Integer pickPriority = 50; // lower = picked first

    @Builder.Default
    @Column(name = "put_away_priority")
    private Integer putAwayPriority = 50; // lower = preferred for put-away

    @Builder.Default
    @Column(name = "fast_moving_zone")
    private Boolean fastMovingZone = false;

    // ✅ temperature control
    @Builder.Default
    @Column(name = "temperature_controlled")
    private Boolean temperatureControlled = false;

    @Column(name = "min_temp")
    private Double minTemp;
    @Column(name = "max_temp")
    private Double maxTemp;

    // ✅ hazmat control
    @Builder.Default
    @Column(name = "hazardous_allowed")
    private Boolean hazardousAllowed = false;

    @Column(name = "hazard_class")
    private String hazardClass; // optional

    // ✅ access control
    @Builder.Default
    @Column(name = "restricted_access")
    private Boolean restrictedAccess = false;

    // ✅ status
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    // ✅ optional zone capacity summary (bins are source of truth)
    @Column(name = "max_weight")
    private Double maxWeight;
    @Column(name = "max_volume")
    private Double maxVolume;

    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rack> racks = new ArrayList<>();
}
