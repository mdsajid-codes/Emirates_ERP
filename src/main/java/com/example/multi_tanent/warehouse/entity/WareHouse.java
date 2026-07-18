package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.warehouse.enums.PickingStrategy;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wms_warehouse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareHouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Builder.Default
    @Column(name = "qc_required")
    private Boolean qcRequired = true;

    @Builder.Default
    @Column(name = "bin_tracking_enabled")
    private Boolean binTrackingEnabled = true;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    private String description;

    // ✅ warehouse behavior settings
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "warehouse_type")
    @Builder.Default
    private WarehouseType warehouseType = WarehouseType.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "default_pick_strategy")
    @Builder.Default
    private PickingStrategy defaultPickStrategy = PickingStrategy.FEFO;

    @Builder.Default
    @Column(name = "allow_negative_stock")
    private Boolean allowNegativeStock = false;

    // ✅ optional: operating hours
    @Column(name = "open_time")
    private LocalTime openTime;
    @Column(name = "close_time")
    private LocalTime closeTime;

    // ✅ optional: geo location
    private Double latitude;
    private Double longitude;

    // ✅ capacity info (optional high-level)
    @Column(name = "total_capacity_weight")
    private Double totalCapacityWeight;
    @Column(name = "total_capacity_volume")
    private Double totalCapacityVolume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant enterprise;

    @Builder.Default
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Floor> floors = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Zone> zones = new ArrayList<>();
}
