package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.warehouse.enums.FloorAccessType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wms_floor", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "warehouse_id", "code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Floor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unique inside warehouse
    @Column(nullable = false)
    private String code; // FL-1, GROUND, B1

    @Column(nullable = false)
    private String name;

    private String description;

    // ✅ important: floor number
    @Column(nullable = false, name = "level_no")
    private Integer levelNo; // -1 basement, 0 ground, 1 first...

    // ✅ optional: layout dimensions
    private Double length;
    private Double width;
    private Double height;

    // ✅ access method
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "access_type")
    private FloorAccessType accessType = FloorAccessType.NONE;

    // ✅ floor restrictions
    @Builder.Default
    @Column(name = "temperature_controlled")
    private Boolean temperatureControlled = false;

    @Column(name = "min_temp")
    private Double minTemp;

    @Column(name = "max_temp")
    private Double maxTemp;

    @Builder.Default
    @Column(name = "hazardous_allowed")
    private Boolean hazardousAllowed = false;

    @Builder.Default
    @Column(name = "restricted_access")
    private Boolean restrictedAccess = false;

    @Builder.Default
    @Column(name = "is_default_floor")
    private Boolean isDefaultFloor = false;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    // relations
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WareHouse warehouse;

    @Builder.Default
    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Zone> zones = new ArrayList<>();

    // ✅ audit fields
    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
