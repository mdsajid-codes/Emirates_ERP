package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.entity.*;
import com.example.multi_tanent.purchases.repository.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;
import com.example.multi_tanent.hanger.service.HngCoilNumberGenerator;
import com.example.multi_tanent.hanger.service.HngCoilStockCreationService;
import com.example.multi_tanent.hanger.enums.WireMaterialType;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.enums.MovementType;
import com.example.multi_tanent.warehouse.enums.ProductSourceType;
import com.example.multi_tanent.warehouse.enums.ReferenceType;
import com.example.multi_tanent.warehouse.enums.StockStatus;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for GRN (Goods Receipt Note) handling.
 *
 * - Prevents receiving more than ordered quantity on each PO line (server-side
 * validation).
 * - Uses a pessimistic lock when loading the PO (recommended) to avoid race
 * conditions where
 * two concurrent requests could both pass validation and over-receive.
 *
 * Make sure your PurPurchaseOrderRepository contains the
 * findByIdWithItemsForUpdate(...) method
 * (example repository snippet provided below).
 */
@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurGrnService {

        private final PurGrnRepository grnRepo;
        private final PurGrnItemRepository grnItemRepo;
        private final PurPurchaseOrderRepository poRepo;
        private final TenantRepository tenantRepo;
        private final ProRawMaterialsRepository rawMaterialsRepo;
        private final InventoryImprovementRepository inventoryImprovementRepo;
        private final WareHouseRepository warehouseRepo;
        private final WareProductsRepository wareProductsRepo;

        @Autowired(required = false)
        private HngCoilNumberGenerator coilNumberGenerator;

        @Autowired(required = false)
        private HngCoilStockCreationService coilStockCreationService;

        private final TenantModuleChecker tenantModuleChecker;

        private Tenant currentTenant() {
                String key = TenantContext.getTenantId();
                return tenantRepo.findByTenantId(key)
                                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
        }

        /**
         * Create a GRN for a purchase order.
         * Validates that receiving the requested quantities will NOT exceed the PO line
         * ordered quantity.
         *
         * @param req the GRN request DTO
         * @return created GRN response DTO
         */
        public PurGrnResponse create(PurGrnRequest req) {
                if (req.getPurchaseOrderId() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "purchaseOrderId required");
                }

                // Recommended: fetch PO with items under a pessimistic write lock to avoid
                // concurrent over-receipts.
                // This requires a repository method: findByIdWithItemsForUpdate(Long id)
                PurPurchaseOrder po = poRepo.findByIdWithItemsForUpdate(req.getPurchaseOrderId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Purchase order not found: " + req.getPurchaseOrderId()));

                Tenant t = currentTenant();

                PurGrn grn = PurGrn.builder()
                                .grnNumber(req.getGrnNumber())
                                .grnDate(req.getGrnDate())
                                .purchaseOrder(po)
                                .remark(req.getRemark())
                                .createdBy(req.getCreatedBy())
                                .createdAt(LocalDateTime.now())
                                .build();

                // ensure list initialized
                if (grn.getItems() == null)
                        grn.setItems(new ArrayList<>());

                if (req.getItems() != null) {
                        for (PurGrnItemRequest ir : req.getItems()) {
                                // find the corresponding PO item
                                PurPurchaseOrderItem poItem = po.getItems().stream()
                                                .filter(i -> Objects.equals(i.getId(), ir.getPurchaseOrderItemId()))
                                                .findFirst()
                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                "PO item not found: " + ir.getPurchaseOrderItemId()));

                                // incoming received quantity (default to zero if null)
                                java.math.BigDecimal incoming = Optional.ofNullable(ir.getReceivedQuantity())
                                                .orElse(java.math.BigDecimal.ZERO);
                                                
                                java.math.BigDecimal accepted = Optional.ofNullable(ir.getAcceptedQuantity())
                                                .orElse(incoming); // default to full received if not specified
                                                
                                java.math.BigDecimal rejected = Optional.ofNullable(ir.getRejectedQuantity())
                                                .orElse(java.math.BigDecimal.ZERO);

                                if (incoming.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                        "Received quantity must be > 0 for PO item " + poItem.getId());
                                }
                                
                                // Validation: accepted + rejected must equal received
                                if (accepted.add(rejected).compareTo(incoming) != 0) {
                                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                        "Accepted + Rejected quantity must equal Received quantity for PO item " + poItem.getId());
                                }

                                java.math.BigDecimal prevReceived = Optional.ofNullable(poItem.getReceivedQuantity())
                                                .orElse(java.math.BigDecimal.ZERO);
                                java.math.BigDecimal newTotalReceived = prevReceived.add(incoming);

                                java.math.BigDecimal orderedQty = Optional.ofNullable(poItem.getQuantity())
                                                .orElse(java.math.BigDecimal.ZERO);

                                // validate does not exceed ordered qty
                                if (newTotalReceived.compareTo(orderedQty) > 0) {
                                        String msg = String.format(
                                                        "Cannot receive %s units for PO item %d — would exceed ordered quantity %s (already received %s).",
                                                        incoming.toPlainString(), poItem.getId(),
                                                        orderedQty.toPlainString(), prevReceived.toPlainString());
                                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
                                }

                                // create GRN item and attach
                                PurGrnItem gi = PurGrnItem.builder()
                                                .purchaseOrderItem(poItem)
                                                .receivedQuantity(incoming)
                                                .acceptedQuantity(accepted)
                                                .rejectedQuantity(rejected)
                                                .rejectionReason(ir.getRejectionReason())
                                                .rate(ir.getRate())
                                                .unit(poItem.getUnit())
                                                .isHangerCoil(Boolean.TRUE.equals(ir.getIsHangerCoil()))
                                                .build();

                                if (Boolean.TRUE.equals(gi.getIsHangerCoil())) {
                                        gi.setHeatNo(ir.getHeatNo());
                                        gi.setLotNo(ir.getLotNo());
                                        if (ir.getMaterialType() != null) {
                                                gi.setMaterialType(WireMaterialType.valueOf(ir.getMaterialType()));
                                        }
                                        gi.setWireGaugeMm(ir.getWireGaugeMm());
                                        gi.setGrossWeightKg(ir.getGrossWeightKg());
                                        gi.setTareWeightKg(ir.getTareWeightKg());
                                        gi.setRatePerKg(ir.getRatePerKg());
                                        gi.setMillCertificateUrl(ir.getMillCertificateUrl());
                                        gi.setWarehouseLocation(ir.getWarehouseLocation());

                                        // Generate coil number if generator is available
                                        if (coilNumberGenerator != null) {
                                                gi.setCoilNo(coilNumberGenerator.generate(t));
                                        }
                                }

                                grn.addItem(gi);

                                // update the PO item received quantity
                                poItem.setReceivedQuantity(newTotalReceived);

                                // ── Stock Update ──────────────────────────────────────────────
                                // Increment raw material stock by the accepted (received) quantity
                                if (poItem.getItem() != null) {
                                        ProRawMaterials rawMaterial = rawMaterialsRepo
                                                        .findById(poItem.getItem().getId())
                                                        .orElse(null);
                                        if (rawMaterial != null) {
                                                // Only add accepted quantity to available stock
                                                BigDecimal currentStock = Optional
                                                                .ofNullable(rawMaterial.getStockQuantity())
                                                                .orElse(BigDecimal.ZERO);
                                                rawMaterial.setStockQuantity(currentStock.add(accepted));
                                                rawMaterialsRepo.save(rawMaterial);

                                                // ── Warehouse Inbound Movement Record ──────────────
                                                // Log this receipt in the warehouse ledger so the
                                                // warehouse module tracks the stock entry.
                                                if (!Boolean.TRUE.equals(gi.getIsHangerCoil())) {
                                                        WareHouse targetWarehouse = null;
                                                        if (ir.getWarehouseId() != null) {
                                                                targetWarehouse = warehouseRepo
                                                                                .findById(ir.getWarehouseId())
                                                                                .orElse(null);
                                                        }
                                                        if (targetWarehouse == null) {
                                                                targetWarehouse = warehouseRepo.fetchByTenant(t)
                                                                                .stream().findFirst().orElse(null);
                                                        }
                                                        if (targetWarehouse != null) {
                                                                final WareHouse finalTargetWarehouse = targetWarehouse;
                                                                WareProducts wareProduct = wareProductsRepo
                                                                        .findByRawMaterialIdAndWarehouseIdAndEnterpriseId(
                                                                                rawMaterial.getId(), finalTargetWarehouse.getId(), t.getId())
                                                                        .orElseGet(() -> createWareProductFromRawMaterial(
                                                                                rawMaterial, finalTargetWarehouse, t));

                                                                if (accepted.compareTo(java.math.BigDecimal.ZERO) > 0) {
                                                                        InventoryImprovement inboundMovement = InventoryImprovement
                                                                                        .builder()
                                                                                        .movementNo("MOV-GRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                                                                        .type(MovementType.INBOUND_RECEIPT)
                                                                                        .status(StockStatus.AVAILABLE)
                                                                                        .product(wareProduct)
                                                                                        .warehouse(finalTargetWarehouse)
                                                                                        .quantity(accepted.doubleValue())
                                                                                        .qtyBefore(currentStock.doubleValue())
                                                                                        .qtyAfter(rawMaterial.getStockQuantity().doubleValue())
                                                                                        .referenceType(ReferenceType.PURCHASE_GRN)
                                                                                        .referenceId(gi.getId() != null ? gi.getId() : 0L)
                                                                                        .enterprise(t)
                                                                                        .movementAt(java.time.LocalDateTime.now())
                                                                                        .remarks("GRN accepted: " + (grn.getGrnNumber() != null ? grn.getGrnNumber() : "N/A"))
                                                                                        .build();
                                                                        inventoryImprovementRepo.save(inboundMovement);
                                                                }

                                                                // If there are rejected items, record them as DAMAGED stock (not added to raw material available stock)
                                                                if (rejected.compareTo(java.math.BigDecimal.ZERO) > 0) {
                                                                        InventoryImprovement rejectedMovement = InventoryImprovement
                                                                                        .builder()
                                                                                        .movementNo("MOV-REJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                                                                        .type(MovementType.INBOUND_RECEIPT)
                                                                                        .status(StockStatus.DAMAGED)
                                                                                        .product(wareProduct)
                                                                                        .warehouse(finalTargetWarehouse)
                                                                                        .quantity(rejected.doubleValue())
                                                                                        .qtyBefore(0.0) // Damaged stock tracked separately
                                                                                        .qtyAfter(rejected.doubleValue())
                                                                                        .referenceType(ReferenceType.PURCHASE_GRN)
                                                                                        .referenceId(gi.getId() != null ? gi.getId() : 0L)
                                                                                        .enterprise(t)
                                                                                        .movementAt(java.time.LocalDateTime.now())
                                                                                        .remarks("GRN rejected: " + gi.getRejectionReason())
                                                                                        .build();
                                                                        inventoryImprovementRepo.save(rejectedMovement);
                                                                }
                                                        }
                                                }
                                                // ────────────────────────────────────────────────────
                                        }
                                }
                                // ─────────────────────────────────────────────────────────────
                        }
                }

                // Save GRN (cascades items) and persist PO updates
                PurGrn saved = grnRepo.save(grn);
                poRepo.save(po); // ensure PO changes persisted (received quantities updated)

                // Post-save: Register coils if service is available and tenant has module
                if (coilStockCreationService != null
                                && tenantModuleChecker.hasModule(ServiceModule.HANGER_MANUFACTURING)) {
                        coilStockCreationService.createFromGrn(saved, t);
                }

                return toResponse(saved);
        }

        @Transactional(readOnly = true)
        public List<PurGrnResponse> listByOrder(Long orderId) {
                List<PurGrn> list = grnRepo.findByPurchaseOrderId(orderId);
                return list.stream().map(this::toResponse).collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public PurGrnResponse getById(Long id) {
                PurGrn g = grnRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("GRN not found: " + id));
                return toResponse(g);
        }

        /* ----- helpers to map entities to DTOs ----- */

        private WareProducts createWareProductFromRawMaterial(ProRawMaterials rm, WareHouse wh, Tenant t) {
                // Creates a new wrapper product for the warehouse
                WareProducts p = WareProducts.builder()
                        .enterprise(t)
                        .sku(rm.getItemCode() != null ? rm.getItemCode() : "RM-" + rm.getId())
                        .name(rm.getName())
                        .sourceType(ProductSourceType.RAW_MATERIAL)
                        .rawMaterial(rm)
                        .warehouse(wh)
                        .purchasePrice(rm.getPurchasePrice())
                        .salePrice(rm.getSalesPrice())
                        .isActive(true)
                        .batchTracking(true)
                        .build();
                return wareProductsRepo.save(p);
        }

        private PurGrnItemResponse itemToResponse(PurGrnItem it) {
                return PurGrnItemResponse.builder()
                                .id(it.getId())
                                .purchaseOrderItemId(
                                                it.getPurchaseOrderItem() != null ? it.getPurchaseOrderItem().getId()
                                                                : null)
                                .itemName(it.getPurchaseOrderItem() != null
                                                && it.getPurchaseOrderItem().getItem() != null
                                                                ? it.getPurchaseOrderItem().getItem().getName()
                                                                : it.getPurchaseOrderItem() != null
                                                                                ? it.getPurchaseOrderItem()
                                                                                                .getDescription()
                                                                                : null)
                                .receivedQuantity(it.getReceivedQuantity())
                                .acceptedQuantity(it.getAcceptedQuantity())
                                .rejectedQuantity(it.getRejectedQuantity())
                                .rejectionReason(it.getRejectionReason())
                                .rate(it.getRate())
                                .unitId(it.getUnit() != null ? it.getUnit().getId() : null)
                                .isHangerCoil(it.getIsHangerCoil())
                                .heatNo(it.getHeatNo())
                                .lotNo(it.getLotNo())
                                .materialType(it.getMaterialType() != null ? it.getMaterialType().name() : null)
                                .wireGaugeMm(it.getWireGaugeMm())
                                .grossWeightKg(it.getGrossWeightKg())
                                .tareWeightKg(it.getTareWeightKg())
                                .netWeightKg(it.getNetWeightKg())
                                .ratePerKg(it.getRatePerKg())
                                .totalValue(it.getTotalValue())
                                .millCertificateUrl(it.getMillCertificateUrl())
                                .warehouseLocation(it.getWarehouseLocation())
                                .coilNo(it.getCoilNo())
                                .build();
        }

        private PurGrnResponse toResponse(PurGrn g) {
                return PurGrnResponse.builder()
                                .id(g.getId())
                                .grnNumber(g.getGrnNumber())
                                .grnDate(g.getGrnDate())
                                .purchaseOrderId(g.getPurchaseOrder() != null ? g.getPurchaseOrder().getId() : null)
                                .remark(g.getRemark())
                                .createdBy(g.getCreatedBy())
                                .createdAt(g.getCreatedAt())
                                .items(Optional.ofNullable(g.getItems()).orElse(Collections.emptyList()).stream()
                                                .map(this::itemToResponse).collect(Collectors.toList()))
                                .build();
        }
}
