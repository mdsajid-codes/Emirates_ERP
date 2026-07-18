package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.MovementType;
import com.example.multi_tanent.warehouse.enums.ReferenceType;
import com.example.multi_tanent.warehouse.enums.StockStatus;
import com.example.multi_tanent.warehouse.enums.SyncStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryImprovementRequest {
    private String movementNo;
    private MovementType type;
    private StockStatus status;
    private StockStatus previousStatus;
    private StockStatus newStatus;

    // Item IDs (only one should typically be set based on the type of movement)
    private Long productId;
    private Long rawMaterialId;
    private Long semifinishedId;
    private Long finishedGoodId;

    private Long batchId;
    private Long serialId;

    // Location IDs
    private Long warehouseId;
    private Long sourceWarehouseId;
    private Long destinationWarehouseId;
    private Long binId;
    private Long sourceBinId;
    private Long destinationBinId;

    // Quantity & Costing
    private Long uomId;
    private Double quantity;
    private Double qtyBefore;
    private Double qtyAfter;
    private Double unitCost;
    private Double totalCost;

    // Reference
    private ReferenceType referenceType;
    private Long referenceId;
    private String remarks;

    // Audit & Mobile
    private Long createdBy;
    private Long approvedBy;
    private LocalDateTime movementAt;
    private String deviceId;
    private LocalDateTime clientTime;
    private SyncStatus syncStatus;
}
