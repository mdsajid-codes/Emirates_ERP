package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProSemifinished;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.warehouse.enums.MovementType;
import com.example.multi_tanent.warehouse.enums.ReferenceType;
import com.example.multi_tanent.warehouse.enums.StockStatus;
import com.example.multi_tanent.warehouse.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wms_inventory_improvement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryImprovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "movement_no")
    private String movementNo; // unique code like MOV-2026-00001

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "type")
    private MovementType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    private StockStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "previous_status")
    private StockStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "new_status")
    private StockStatus newStatus;

    // --- Product Relations ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private WareProducts product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id")
    private ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semifinished_id")
    private ProSemifinished semifinished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_good_id")
    private ProFinishedGood finishedGood;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private WareProductBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private WareProductSerial serial;

    // --- Traceability & Warehouse ---
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private WareHouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_warehouse_id")
    private WareHouse sourceWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_warehouse_id")
    private WareHouse destinationWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_id")
    private Bin bin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_bin_id")
    private Bin sourceBin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_bin_id")
    private Bin destinationBin;

    // --- Quantity & UoM ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uom_id")
    private UoM uom;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "qty_before")
    private Double qtyBefore;

    @Column(name = "qty_after")
    private Double qtyAfter;

    // --- Value & Costing ---
    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(name = "total_cost")
    private Double totalCost;

    // --- Reference ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "reference_type")
    private ReferenceType referenceType;

    @Column(nullable = false, name = "reference_id")
    private Long referenceId; // points to GRN/Transfer/Order etc

    private String remarks;

    // --- Audit ---
    @Column(nullable = false, name = "created_by")
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Builder.Default
    @Column(nullable = false, name = "movement_at")
    private LocalDateTime movementAt = LocalDateTime.now();

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "device_id")
    private String deviceId; // scanner device id
    @Column(name = "client_time")
    private LocalDateTime clientTime; // mobile offline timestamp

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "sync_status")
    private SyncStatus syncStatus; // PENDING_SYNC / SYNCED

    // --- Multi-Tenancy ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (syncStatus == null) {
            syncStatus = SyncStatus.SYNCED;
        }
    }
}
