package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.production.repository.ProFinishedGoodRepository;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.production.repository.ProSemiFinishedRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.InventoryImprovementRequest;
import com.example.multi_tanent.warehouse.dto.InventoryImprovementResponse;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
@Slf4j
public class InventoryImprovementService {

    private final InventoryImprovementRepository inventoryImprovementRepository;
    private final WareHouseRepository warehouseRepository;
    private final BinRepository binRepository;
    private final WareProductsRepository wareProductsRepository;
    private final ProRawMaterialsRepository proRawMaterialsRepository;
    private final ProSemiFinishedRepository proSemiFinishedRepository;
    private final ProFinishedGoodRepository proFinishedGoodRepository;
    private final WareProductBatchRepository wareProductBatchRepository;
    private final WareProductSerialRepository wareProductSerialRepository;
    private final UoMRepository uomRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public List<InventoryImprovementResponse> getAll() {
        Tenant tenant = getCurrentTenant();
        return inventoryImprovementRepository.findByEnterpriseId(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventoryImprovementResponse getById(Long id) {
        Tenant tenant = getCurrentTenant();
        return inventoryImprovementRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Movement not found with id: " + id));
    }

    public InventoryImprovementResponse create(InventoryImprovementRequest request) {
        Tenant tenant = getCurrentTenant();

        InventoryImprovement movement = InventoryImprovement.builder()
                .movementNo(request.getMovementNo())
                .type(request.getType())
                .status(request.getStatus())
                .previousStatus(request.getPreviousStatus())
                .newStatus(request.getNewStatus())
                .quantity(request.getQuantity())
                .qtyBefore(request.getQtyBefore())
                .qtyAfter(request.getQtyAfter())
                .unitCost(request.getUnitCost())
                .totalCost(request.getTotalCost())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .remarks(request.getRemarks())
                .createdBy(request.getCreatedBy())
                .approvedBy(request.getApprovedBy())
                .movementAt(request.getMovementAt() != null ? request.getMovementAt() : java.time.LocalDateTime.now())
                .deviceId(request.getDeviceId())
                .clientTime(request.getClientTime())
                .syncStatus(request.getSyncStatus())
                .enterprise(tenant)
                .build();

        // --- Auto Stock Update ---
        // Resolve the product first (needed for stock update)
        com.example.multi_tanent.warehouse.entity.WareProducts product = null;
        if (request.getProductId() != null) {
            product = wareProductsRepository.findById(request.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));
            movement.setProduct(product);

            // Auto-calculate qtyBefore from current stock
            java.math.BigDecimal currentStock = product.getStockQuantity() != null
                    ? product.getStockQuantity() : java.math.BigDecimal.ZERO;
            movement.setQtyBefore(currentStock.doubleValue());

            // Determine stock delta based on movement type
            java.math.BigDecimal qty = java.math.BigDecimal.valueOf(
                    request.getQuantity() != null ? request.getQuantity() : 0.0);

            java.math.BigDecimal newStock;
            switch (request.getType()) {
                // --- Stock INCREASING types ---
                case INWARD:
                case INBOUND_RECEIPT:
                case ADJUSTMENT_IN:
                case PRODUCTION_RECEIPT:
                case TRANSFER_RECEIVE:
                case QC_ACCEPT:
                case PUT_AWAY:
                    newStock = currentStock.add(qty);
                    break;

                // --- Stock DECREASING types ---
                case OUTWARD:
                case SALES_DISPATCH:
                case PRODUCTION_ISSUE:
                case TRANSFER_DISPATCH:
                case ADJUSTMENT_OUT:
                case SCRAP:
                case PICK:
                case QC_REJECT:
                    newStock = currentStock.subtract(qty);
                    if (newStock.compareTo(java.math.BigDecimal.ZERO) < 0) {
                        throw new IllegalStateException(
                                "Insufficient stock. Current: " + currentStock + ", Requested: " + qty);
                    }
                    break;

                // --- No stock change (status change only) ---
                case TRANSFER:
                case ADJUSTMENT:
                case STOCK_ADJUSTMENT:
                case QC_HOLD:
                case PACK:
                default:
                    newStock = currentStock;
                    break;
            }

            movement.setQtyAfter(newStock.doubleValue());

            // Update the product's stock quantity
            product.setStockQuantity(newStock);
            wareProductsRepository.save(product);

            log.info("Stock updated for product [{}]: {} → {} (type={}, qty={})",
                    product.getSku(), currentStock, newStock, request.getType(), qty);
        }

        // Resolve remaining relations (skip product - already done above)
        if (product == null && request.getProductId() != null) {
            // Already handled above
        }
        if (request.getRawMaterialId() != null) {
            movement.setRawMaterial(proRawMaterialsRepository.findById(request.getRawMaterialId())
                    .orElseThrow(() -> new EntityNotFoundException("Raw material not found")));
        }
        if (request.getSemifinishedId() != null) {
            movement.setSemifinished(proSemiFinishedRepository.findById(request.getSemifinishedId())
                    .orElseThrow(() -> new EntityNotFoundException("Semifinished not found")));
        }
        if (request.getFinishedGoodId() != null) {
            movement.setFinishedGood(proFinishedGoodRepository.findById(request.getFinishedGoodId())
                    .orElseThrow(() -> new EntityNotFoundException("Finished good not found")));
        }
        if (request.getBatchId() != null) {
            movement.setBatch(wareProductBatchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new EntityNotFoundException("Batch not found")));
        }
        if (request.getSerialId() != null) {
            movement.setSerial(wareProductSerialRepository.findById(request.getSerialId())
                    .orElseThrow(() -> new EntityNotFoundException("Serial not found")));
        }
        if (request.getWarehouseId() != null) {
            movement.setWarehouse(warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new EntityNotFoundException("Warehouse not found")));
        }
        if (request.getSourceWarehouseId() != null) {
            movement.setSourceWarehouse(warehouseRepository.findById(request.getSourceWarehouseId())
                    .orElseThrow(() -> new EntityNotFoundException("Source warehouse not found")));
        }
        if (request.getDestinationWarehouseId() != null) {
            movement.setDestinationWarehouse(warehouseRepository.findById(request.getDestinationWarehouseId())
                    .orElseThrow(() -> new EntityNotFoundException("Destination warehouse not found")));
        }
        if (request.getBinId() != null) {
            movement.setBin(binRepository.findById(request.getBinId())
                    .orElseThrow(() -> new EntityNotFoundException("Bin not found")));
        }
        if (request.getSourceBinId() != null) {
            movement.setSourceBin(binRepository.findById(request.getSourceBinId())
                    .orElseThrow(() -> new EntityNotFoundException("Source bin not found")));
        }
        if (request.getDestinationBinId() != null) {
            movement.setDestinationBin(binRepository.findById(request.getDestinationBinId())
                    .orElseThrow(() -> new EntityNotFoundException("Destination bin not found")));
        }
        if (request.getUomId() != null) {
            movement.setUom(uomRepository.findById(request.getUomId())
                    .orElseThrow(() -> new EntityNotFoundException("UoM not found")));
        }

        return toResponse(inventoryImprovementRepository.save(movement));
    }

    public void delete(Long id) {
        Tenant tenant = getCurrentTenant();
        InventoryImprovement movement = inventoryImprovementRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Movement not found with id: " + id));
        inventoryImprovementRepository.delete(movement);
    }

    @Transactional(readOnly = true)
    public List<InventoryImprovementResponse> getByStatus(com.example.multi_tanent.warehouse.enums.StockStatus status) {
        Tenant tenant = getCurrentTenant();
        return inventoryImprovementRepository.findByStatusAndEnterpriseId(status, tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryImprovementResponse> getByWarehouse(Long warehouseId) {
        Tenant tenant = getCurrentTenant();
        return inventoryImprovementRepository.findByWarehouseIdAndEnterpriseId(warehouseId, tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InventoryImprovementResponse updateQuantity(Long id, Double quantity) {
        Tenant tenant = getCurrentTenant();
        InventoryImprovement movement = inventoryImprovementRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Movement not found with id: " + id));

        movement.setQuantity(quantity);
        // Optionally update qtyAfter if business logic requires it, but for a simple
        // update:
        return toResponse(inventoryImprovementRepository.save(movement));
    }

    @Transactional(readOnly = true)
    public List<InventoryImprovementResponse> getByType(com.example.multi_tanent.warehouse.enums.MovementType type) {
        Tenant tenant = getCurrentTenant();
        return inventoryImprovementRepository.findByTypeAndEnterpriseId(type, tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InventoryImprovementResponse updateStatus(Long id, com.example.multi_tanent.warehouse.enums.StockStatus newStatus) {
        Tenant tenant = getCurrentTenant();
        InventoryImprovement movement = inventoryImprovementRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Movement not found with id: " + id));

        movement.setPreviousStatus(movement.getStatus());
        movement.setStatus(newStatus);
        movement.setNewStatus(newStatus);

        return toResponse(inventoryImprovementRepository.save(movement));
    }

    private InventoryImprovementResponse toResponse(InventoryImprovement entity) {
        InventoryImprovementResponse response = InventoryImprovementResponse.builder()
                .id(entity.getId())
                .movementNo(entity.getMovementNo())
                .type(entity.getType())
                .status(entity.getStatus())
                .previousStatus(entity.getPreviousStatus())
                .newStatus(entity.getNewStatus())
                .quantity(entity.getQuantity())
                .qtyBefore(entity.getQtyBefore())
                .qtyAfter(entity.getQtyAfter())
                .unitCost(entity.getUnitCost())
                .totalCost(entity.getTotalCost())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .approvedBy(entity.getApprovedBy())
                .movementAt(entity.getMovementAt())
                .createdAt(entity.getCreatedAt())
                .approvedAt(entity.getApprovedAt())
                .deviceId(entity.getDeviceId())
                .clientTime(entity.getClientTime())
                .syncStatus(entity.getSyncStatus())
                .build();

        if (entity.getProduct() != null) {
            response.setProductId(entity.getProduct().getId());
            response.setProductName(entity.getProduct().getName());
        }
        if (entity.getRawMaterial() != null) {
            response.setRawMaterialId(entity.getRawMaterial().getId());
            response.setRawMaterialName(entity.getRawMaterial().getName());
        }
        if (entity.getSemifinished() != null) {
            response.setSemifinishedId(entity.getSemifinished().getId());
            response.setSemifinishedName(entity.getSemifinished().getName());
        }
        if (entity.getFinishedGood() != null) {
            response.setFinishedGoodId(entity.getFinishedGood().getId());
            response.setFinishedGoodName(entity.getFinishedGood().getName());
        }
        if (entity.getBatch() != null) {
            response.setBatchId(entity.getBatch().getId());
            response.setBatchNumber(entity.getBatch().getBatchNumber());
        }
        if (entity.getSerial() != null) {
            response.setSerialId(entity.getSerial().getId());
            response.setSerialNumber(entity.getSerial().getSerialNumber());
        }
        if (entity.getWarehouse() != null) {
            response.setWarehouseId(entity.getWarehouse().getId());
            response.setWarehouseName(entity.getWarehouse().getName());
        }
        if (entity.getSourceWarehouse() != null) {
            response.setSourceWarehouseId(entity.getSourceWarehouse().getId());
            response.setSourceWarehouseName(entity.getSourceWarehouse().getName());
        }
        if (entity.getDestinationWarehouse() != null) {
            response.setDestinationWarehouseId(entity.getDestinationWarehouse().getId());
            response.setDestinationWarehouseName(entity.getDestinationWarehouse().getName());
        }
        if (entity.getBin() != null) {
            response.setBinId(entity.getBin().getId());
            response.setBinCode(entity.getBin().getBinCode());
        }
        if (entity.getSourceBin() != null) {
            response.setSourceBinId(entity.getSourceBin().getId());
            response.setSourceBinCode(entity.getSourceBin().getBinCode());
        }
        if (entity.getDestinationBin() != null) {
            response.setDestinationBinId(entity.getDestinationBin().getId());
            response.setDestinationBinCode(entity.getDestinationBin().getBinCode());
        }
        if (entity.getUom() != null) {
            response.setUomId(entity.getUom().getId());
            response.setUomName(entity.getUom().getName());
        }

        return response;
    }
}
