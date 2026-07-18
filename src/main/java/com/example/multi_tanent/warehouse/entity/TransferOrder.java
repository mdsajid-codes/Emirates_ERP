package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.warehouse.enums.TransferStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wms_transfer_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "transfer_number")
    private String transferNumber;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "source_warehouse_id")
    private WareHouse sourceWarehouse;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_warehouse_id")
    private WareHouse destinationWarehouse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    @Builder.Default
    private TransferStatus status = TransferStatus.DRAFT;

    @Column(name = "requested_date")
    private LocalDate requestedDate;

    @Column(name = "dispatched_date")
    private LocalDateTime dispatchedDate;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    private String remarks;

    @Column(nullable = false, name = "created_by")
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    // --- Multi-Tenancy ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant enterprise;

    @Builder.Default
    @OneToMany(mappedBy = "transferOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransferOrderItem> items = new ArrayList<>();

    // --- Audit ---
    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(TransferOrderItem item) {
        items.add(item);
        item.setTransferOrder(this);
    }
}
