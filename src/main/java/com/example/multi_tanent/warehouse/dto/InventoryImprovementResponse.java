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
public class InventoryImprovementResponse {
    private Long id;
    private String movementNo;
    private MovementType type;
    private StockStatus status;
    private StockStatus previousStatus;
    private StockStatus newStatus;

    // Item Info
    private Long productId;
    private String productName;
    private Long rawMaterialId;
    private String rawMaterialName;
    private Long semifinishedId;
    private String semifinishedName;
    private Long finishedGoodId;
    private String finishedGoodName;

    private Long batchId;
    private String batchNumber;
    private Long serialId;
    private String serialNumber;

    // Location Info
    private Long warehouseId;
    private String warehouseName;
    private Long sourceWarehouseId;
    private String sourceWarehouseName;
    private Long destinationWarehouseId;
    private String destinationWarehouseName;
    private Long binId;
    private String binCode;
    private Long sourceBinId;
    private String sourceBinCode;
    private Long destinationBinId;
    private String destinationBinCode;

    // Quantity & Costing
    private Long uomId;
    private String uomName;
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
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String deviceId;
    private LocalDateTime clientTime;
    private SyncStatus syncStatus;
}
