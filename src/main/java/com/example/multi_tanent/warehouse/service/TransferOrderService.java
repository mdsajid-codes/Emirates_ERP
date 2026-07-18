package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.*;
import com.example.multi_tanent.warehouse.entity.*;
import com.example.multi_tanent.warehouse.enums.*;
import com.example.multi_tanent.warehouse.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferOrderService {

    private final TransferOrderRepository transferRepo;
    private final WareHouseRepository warehouseRepo;
    private final WareProductsRepository productRepo;
    private final WareProductBatchRepository batchRepo;
    private final BinRepository binRepo;
    private final InventoryImprovementRepository inventoryRepo;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    private String generateTransferNumber() {
        return "TRF-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    @Transactional
    public TransferOrderResponse create(TransferOrderRequest req, Long userId) {
        Tenant t = getCurrentTenant();

        if (req.getSourceWarehouseId().equals(req.getDestinationWarehouseId())) {
            throw new IllegalArgumentException("Source and destination warehouses cannot be the same");
        }

        WareHouse sourceWh = warehouseRepo.findByIdAndEnterpriseId(req.getSourceWarehouseId(), t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Source warehouse not found"));
        WareHouse destWh = warehouseRepo.findByIdAndEnterpriseId(req.getDestinationWarehouseId(), t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Destination warehouse not found"));

        TransferOrder order = TransferOrder.builder()
                .transferNumber(generateTransferNumber())
                .sourceWarehouse(sourceWh)
                .destinationWarehouse(destWh)
                .status(TransferStatus.DRAFT)
                .requestedDate(req.getRequestedDate())
                .remarks(req.getRemarks())
                .createdBy(userId)
                .enterprise(t)
                .build();

        for (TransferOrderItemRequest itemReq : req.getItems()) {
            WareProducts product = productRepo.findByIdAndEnterpriseId(itemReq.getProductId(), t.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + itemReq.getProductId()));
            
            WareProductBatch batch = null;
            if (itemReq.getBatchId() != null) {
                batch = batchRepo.findById(itemReq.getBatchId()).orElse(null);
            }
            
            Bin sourceBin = null;
            if (itemReq.getSourceBinId() != null) {
                sourceBin = binRepo.findById(itemReq.getSourceBinId()).orElse(null);
            }
            Bin destBin = null;
            if (itemReq.getDestinationBinId() != null) {
                destBin = binRepo.findById(itemReq.getDestinationBinId()).orElse(null);
            }

            TransferOrderItem item = TransferOrderItem.builder()
                    .product(product)
                    .batch(batch)
                    .requestedQty(itemReq.getRequestedQty())
                    .sourceBin(sourceBin)
                    .destinationBin(destBin)
                    .remarks(itemReq.getRemarks())
                    .build();
            order.addItem(item);
        }

        TransferOrder saved = transferRepo.save(order);
        return toResponse(saved);
    }

    @Transactional
    public TransferOrderResponse approve(Long id, Long approverId) {
        Tenant t = getCurrentTenant();
        TransferOrder order = transferRepo.findByIdAndEnterpriseId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transfer not found"));

        if (order.getStatus() != TransferStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT transfers can be approved");
        }

        order.setStatus(TransferStatus.APPROVED);
        order.setApprovedBy(approverId);
        return toResponse(transferRepo.save(order));
    }

    @Transactional
    public TransferOrderResponse dispatch(Long id, List<TransferOrderItemRequest> dispatchItems, Long userId) {
        Tenant t = getCurrentTenant();
        TransferOrder order = transferRepo.findByIdAndEnterpriseId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transfer not found"));

        if (order.getStatus() != TransferStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED transfers can be dispatched");
        }

        order.setStatus(TransferStatus.DISPATCHED);
        order.setDispatchedDate(LocalDateTime.now());

        // Process item dispatches
        for (TransferOrderItemRequest reqItem : dispatchItems) {
            TransferOrderItem orderItem = order.getItems().stream()
                    .filter(i -> i.getId().equals(reqItem.getId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Item not found in order: " + reqItem.getId()));

            BigDecimal dispatchQty = reqItem.getDispatchedQty();
            if (dispatchQty == null || dispatchQty.compareTo(BigDecimal.ZERO) < 0) {
                dispatchQty = BigDecimal.ZERO;
            }
            if (dispatchQty.compareTo(orderItem.getRequestedQty()) > 0) {
                throw new IllegalArgumentException("Cannot dispatch more than requested for item " + orderItem.getId());
            }

            orderItem.setDispatchedQty(dispatchQty);

            // Create InventoryImprovement (Stock OUT at source)
            if (dispatchQty.compareTo(BigDecimal.ZERO) > 0) {
                WareProducts srcProduct = orderItem.getProduct();
                BigDecimal currentStock = srcProduct.getStockQuantity() != null ? srcProduct.getStockQuantity() : BigDecimal.ZERO;

                if (currentStock.compareTo(dispatchQty) < 0) {
                    throw new IllegalArgumentException("Insufficient stock for product " + srcProduct.getId() + ". Current: " + currentStock + ", Requested dispatch: " + dispatchQty);
                }

                double qtyBefore = currentStock.doubleValue();
                srcProduct.setStockQuantity(currentStock.subtract(dispatchQty));
                productRepo.save(srcProduct);
                double qtyAfter = srcProduct.getStockQuantity().doubleValue();

                InventoryImprovement movement = InventoryImprovement.builder()
                        .movementNo("MOV-TRFD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .type(MovementType.TRANSFER_DISPATCH)
                        .status(StockStatus.TRANSIT)
                        .product(srcProduct)
                        .batch(orderItem.getBatch())
                        .warehouse(order.getSourceWarehouse())
                        .destinationWarehouse(order.getDestinationWarehouse())
                        .bin(orderItem.getSourceBin())
                        .quantity(dispatchQty.doubleValue())
                        .qtyBefore(qtyBefore)
                        .qtyAfter(qtyAfter)
                        .referenceType(ReferenceType.TRANSFER)
                        .referenceId(order.getId())
                        .enterprise(t)
                        .createdBy(userId)
                        .remarks("Transfer Dispatch")
                        .build();
                inventoryRepo.save(movement);
            }
        }

        return toResponse(transferRepo.save(order));
    }

    @Transactional
    public TransferOrderResponse receive(Long id, List<TransferOrderItemRequest> receiveItems, Long userId) {
        Tenant t = getCurrentTenant();
        TransferOrder order = transferRepo.findByIdAndEnterpriseId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transfer not found"));

        if (order.getStatus() != TransferStatus.DISPATCHED && order.getStatus() != TransferStatus.IN_TRANSIT) {
            throw new IllegalStateException("Only DISPATCHED or IN_TRANSIT transfers can be received");
        }

        order.setStatus(TransferStatus.RECEIVED);
        order.setReceivedDate(LocalDateTime.now());

        // Process item receipts
        for (TransferOrderItemRequest reqItem : receiveItems) {
            TransferOrderItem orderItem = order.getItems().stream()
                    .filter(i -> i.getId().equals(reqItem.getId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Item not found in order: " + reqItem.getId()));

            BigDecimal recvQty = reqItem.getReceivedQty();
            if (recvQty == null || recvQty.compareTo(BigDecimal.ZERO) < 0) {
                recvQty = BigDecimal.ZERO;
            }
            if (recvQty.compareTo(orderItem.getDispatchedQty()) > 0) {
                throw new IllegalArgumentException("Cannot receive more than dispatched for item " + orderItem.getId());
            }

            orderItem.setReceivedQty(recvQty);

            if (reqItem.getDestinationBinId() != null) {
                Bin destBin = binRepo.findById(reqItem.getDestinationBinId()).orElse(null);
                orderItem.setDestinationBin(destBin);
            }

            // Create InventoryImprovement (Stock IN at destination)
            if (recvQty.compareTo(BigDecimal.ZERO) > 0) {
                // Determine destination product representation 
                // Normally it's the exact same product, but we must make sure the destination warehouse is correctly recorded
                // Currently `product` points to the WareProducts in the SOURCE warehouse. 
                // We need to look up or create the equivalent WareProducts in the DESTINATION warehouse.
                WareProducts destProduct = null;
                
                WareProducts srcProd = orderItem.getProduct();
                if (srcProd.getRawMaterial() != null) {
                    destProduct = productRepo.findByRawMaterialIdAndWarehouseIdAndEnterpriseId(
                            srcProd.getRawMaterial().getId(), order.getDestinationWarehouse().getId(), t.getId()
                    ).orElse(srcProd); // Fallback to source product if not found
                } else if (srcProd.getCrmProduct() != null) {
                    destProduct = productRepo.findByCrmProductIdAndWarehouseIdAndEnterpriseId(
                            srcProd.getCrmProduct().getId(), order.getDestinationWarehouse().getId(), t.getId()
                    ).orElse(srcProd);
                } else if (srcProd.getFinishedGood() != null) {
                    destProduct = productRepo.findByFinishedGoodIdAndWarehouseIdAndEnterpriseId(
                            srcProd.getFinishedGood().getId(), order.getDestinationWarehouse().getId(), t.getId()
                    ).orElse(srcProd);
                } else if (srcProd.getSemifinished() != null) {
                    destProduct = productRepo.findBySemifinishedIdAndWarehouseIdAndEnterpriseId(
                            srcProd.getSemifinished().getId(), order.getDestinationWarehouse().getId(), t.getId()
                    ).orElse(srcProd);
                } else {
                    destProduct = srcProd; // STANDALONE product
                }

                // Auto Stock Update Logic
                BigDecimal currentStock = destProduct.getStockQuantity() != null ? destProduct.getStockQuantity() : BigDecimal.ZERO;
                double qtyBefore = currentStock.doubleValue();
                destProduct.setStockQuantity(currentStock.add(recvQty));
                productRepo.save(destProduct);
                double qtyAfter = destProduct.getStockQuantity().doubleValue();

                InventoryImprovement movement = InventoryImprovement.builder()
                        .movementNo("MOV-TRFR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .type(MovementType.TRANSFER_RECEIVE)
                        .status(StockStatus.AVAILABLE)
                        .product(destProduct)
                        .batch(orderItem.getBatch())
                        .warehouse(order.getDestinationWarehouse())
                        .sourceWarehouse(order.getSourceWarehouse())
                        .bin(orderItem.getDestinationBin())
                        .quantity(recvQty.doubleValue())
                        .qtyBefore(qtyBefore)
                        .qtyAfter(qtyAfter)
                        .referenceType(ReferenceType.TRANSFER)
                        .referenceId(order.getId())
                        .enterprise(t)
                        .createdBy(userId)
                        .remarks("Transfer Receive")
                        .build();
                inventoryRepo.save(movement);
            }
        }

        return toResponse(transferRepo.save(order));
    }

    @Transactional
    public TransferOrderResponse cancel(Long id) {
        Tenant t = getCurrentTenant();
        TransferOrder order = transferRepo.findByIdAndEnterpriseId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transfer not found"));

        if (order.getStatus() != TransferStatus.DRAFT && order.getStatus() != TransferStatus.APPROVED) {
            throw new IllegalStateException("Transfers can only be cancelled before dispatch");
        }

        order.setStatus(TransferStatus.CANCELLED);
        return toResponse(transferRepo.save(order));
    }

    @Transactional(readOnly = true)
    public Page<TransferOrderResponse> list(Pageable pageable) {
        Tenant t = getCurrentTenant();
        return transferRepo.findByEnterpriseId(t.getId(), pageable).map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<TransferOrderResponse> listByStatus(TransferStatus status, Pageable pageable) {
        Tenant t = getCurrentTenant();
        return transferRepo.findByStatusAndEnterpriseId(status, t.getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TransferOrderResponse getById(Long id) {
        Tenant t = getCurrentTenant();
        return transferRepo.findByIdAndEnterpriseId(id, t.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Transfer not found"));
    }

    private TransferOrderResponse toResponse(TransferOrder o) {
        return TransferOrderResponse.builder()
                .id(o.getId())
                .transferNumber(o.getTransferNumber())
                .sourceWarehouseId(o.getSourceWarehouse().getId())
                .sourceWarehouseName(o.getSourceWarehouse().getName())
                .sourceWarehouseCode(o.getSourceWarehouse().getCode())
                .destinationWarehouseId(o.getDestinationWarehouse().getId())
                .destinationWarehouseName(o.getDestinationWarehouse().getName())
                .destinationWarehouseCode(o.getDestinationWarehouse().getCode())
                .status(o.getStatus())
                .requestedDate(o.getRequestedDate())
                .dispatchedDate(o.getDispatchedDate())
                .receivedDate(o.getReceivedDate())
                .remarks(o.getRemarks())
                .createdBy(o.getCreatedBy())
                .approvedBy(o.getApprovedBy())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .items(o.getItems().stream().map(this::itemToResponse).collect(Collectors.toList()))
                .build();
    }

    private TransferOrderItemResponse itemToResponse(TransferOrderItem i) {
        return TransferOrderItemResponse.builder()
                .id(i.getId())
                .transferOrderId(i.getTransferOrder().getId())
                .productId(i.getProduct().getId())
                .productCode(i.getProduct().getSku())
                .productName(i.getProduct().getName())
                .productBarcode(i.getProduct().getBarcode())
                .batchId(i.getBatch() != null ? i.getBatch().getId() : null)
                .batchNumber(i.getBatch() != null ? i.getBatch().getBatchNumber() : null)
                .requestedQty(i.getRequestedQty())
                .dispatchedQty(i.getDispatchedQty())
                .receivedQty(i.getReceivedQty())
                .sourceBinId(i.getSourceBin() != null ? i.getSourceBin().getId() : null)
                .sourceBinCode(i.getSourceBin() != null ? i.getSourceBin().getBinCode() : null)
                .destinationBinId(i.getDestinationBin() != null ? i.getDestinationBin().getId() : null)
                .destinationBinCode(i.getDestinationBin() != null ? i.getDestinationBin().getBinCode() : null)
                .remarks(i.getRemarks())
                .build();
    }
}
