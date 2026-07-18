package com.example.multi_tanent.materials.service.impl;

import com.example.multi_tanent.materials.dto.MaterialIssueDetailRequest;
import com.example.multi_tanent.materials.dto.MaterialIssueRequest;
import com.example.multi_tanent.materials.dto.MaterialIssueResponse;
import com.example.multi_tanent.materials.entity.MaterialIssue;
import com.example.multi_tanent.materials.entity.MaterialIssueDetail;
import com.example.multi_tanent.materials.entity.MaterialRequision;
import com.example.multi_tanent.materials.repository.MaterialIssueRepository;
import com.example.multi_tanent.materials.repository.MaterialRequisionRepository;
import com.example.multi_tanent.materials.service.MaterialIssueService;
import com.example.multi_tanent.production.entity.ProProcess;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.repository.ProProcessRepository;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.security.JwtUtil;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.MovementType;
import com.example.multi_tanent.warehouse.enums.ReferenceType;
import com.example.multi_tanent.warehouse.enums.StockStatus;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialIssueServiceImpl implements MaterialIssueService {

        private final MaterialIssueRepository materialIssueRepository;
        private final MaterialRequisionRepository materialRequisionRepository;
        private final ProRawMaterialsRepository proRawMaterialsRepository;
        private final ProProcessRepository proProcessRepository;
        private final TenantRepository tenantRepository;
        private final com.example.multi_tanent.hanger.repository.HngCoilStockRepository hngCoilStockRepository;
        private final InventoryImprovementRepository inventoryImprovementRepository;
        private final WareHouseRepository warehouseRepository;
        private final jakarta.persistence.EntityManager entityManager;

        @Override
        @Transactional
        public MaterialIssueResponse create(MaterialIssueRequest request, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialRequision materialRequisition = materialRequisionRepository
                                .findByIdAndTenant(request.getMaterialRequisitionId(), tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Requisition not found"));

                MaterialIssue materialIssue = MaterialIssue.builder()
                                .tenant(tenant)
                                .issueNo("ISSUE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .issueDate(request.getIssueDate())
                                .materialRequisition(materialRequisition)
                                .remarks(request.getRemarks())
                                .details(new ArrayList<>())
                                .build();

                if (request.getDetails() != null) {
                        for (MaterialIssueDetailRequest detailRequest : request.getDetails()) {
                                ProRawMaterials rawMaterial = proRawMaterialsRepository
                                                .findByIdAndTenant(detailRequest.getRawMaterialId(), tenant)
                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                "Raw Material not found: "
                                                                                + detailRequest.getRawMaterialId()));

                                ProProcess process = null;
                                if (detailRequest.getProcessId() != null) {
                                        process = proProcessRepository
                                                        .findByIdAndTenant(detailRequest.getProcessId(), tenant)
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Process not found: " + detailRequest
                                                                                        .getProcessId()));
                                }

                                MaterialIssueDetail detail = MaterialIssueDetail.builder()
                                                .materialIssue(materialIssue)
                                                .rawMaterial(rawMaterial)
                                                .process(process)
                                                .issuedQuantity(detailRequest.getIssuedQuantity())
                                                .build();

                                // Hanger Phase 3: Coil Deduction
                                if (detailRequest.getCoilRefId() != null) {
                                        com.example.multi_tanent.hanger.entity.HngCoilStock coil = hngCoilStockRepository
                                                        .findById(detailRequest.getCoilRefId())
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Coil not found: " + detailRequest
                                                                                        .getCoilRefId()));
                                        detail.setCoilRef(coil);
                                        detail.setIssuedWeightKg(detailRequest.getIssuedWeightKg());

                                        // Deduct weight from coil stock
                                        coil.issueWeight(detailRequest.getIssuedWeightKg());
                                        hngCoilStockRepository.save(coil);
                                }

                                materialIssue.getDetails().add(detail);

                                // ── Stock Deduction & Warehouse Movement ───────────────────────
                                handleStockDeduction(tenant, rawMaterial, detailRequest.getIssuedQuantity(),
                                                materialRequisition, detailRequest.getWarehouseId());
                                // ─────────────────────────────────────────────────────────────
                        }
                }

                MaterialIssue savedIssue = materialIssueRepository
                                .save(materialIssue);
                return MaterialIssueResponse.fromEntity(savedIssue);
        }

        @Override
        @Transactional
        public MaterialIssueResponse update(Long id, MaterialIssueRequest request,
                        HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIssue materialIssue = materialIssueRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Issue not found"));

                if (request.getMaterialRequisitionId() != null) {
                        MaterialRequision materialRequisition = materialRequisionRepository
                                        .findByIdAndTenant(request.getMaterialRequisitionId(), tenant)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Material Requisition not found"));
                        materialIssue.setMaterialRequisition(materialRequisition);
                }

                if (request.getIssueDate() != null)
                        materialIssue.setIssueDate(request.getIssueDate());
                if (request.getRemarks() != null)
                        materialIssue.setRemarks(request.getRemarks());

                if (request.getDetails() != null) {
                        List<MaterialIssueDetailRequest> incomingRequests = request.getDetails();
                        List<MaterialIssueDetail> currentDetails = materialIssue.getDetails();
                        List<MaterialIssueDetail> detailsToAdd = new ArrayList<>();
                        java.util.Set<Long> matchedDetailIds = new java.util.HashSet<>();

                        // 1. Update existing and Identify new ones
                        for (MaterialIssueDetailRequest req : incomingRequests) {
                                boolean matched = false;
                                for (MaterialIssueDetail existing : currentDetails) {
                                        if (matchedDetailIds.contains(existing.getId()))
                                                continue;

                                        Long existingRawMatId = existing.getRawMaterial().getId();
                                        Long reqRawMatId = req.getRawMaterialId();
                                        Long existingProcessId = existing.getProcess() != null
                                                        ? existing.getProcess().getId()
                                                        : null;
                                        Long reqProcessId = req.getProcessId();

                                        boolean rawMatMatch = existingRawMatId.equals(reqRawMatId);
                                        boolean processMatch = (existingProcessId == null && reqProcessId == null)
                                                        || (existingProcessId != null
                                                                        && existingProcessId.equals(reqProcessId));

                                        if (rawMatMatch && processMatch) {
                                                // Handle stock adjustment for existing detail
                                                java.math.BigDecimal oldQty = existing.getIssuedQuantity() != null
                                                                ? existing.getIssuedQuantity()
                                                                : java.math.BigDecimal.ZERO;
                                                java.math.BigDecimal newQty = req.getIssuedQuantity();
                                                java.math.BigDecimal diff = newQty.subtract(oldQty);

                                                if (diff.compareTo(java.math.BigDecimal.ZERO) != 0) {
                                                        handleStockDeduction(tenant, existing.getRawMaterial(), diff,
                                                                        materialIssue.getMaterialRequisition(),
                                                                        req.getWarehouseId());
                                                }

                                                existing.setIssuedQuantity(req.getIssuedQuantity());
                                                matchedDetailIds.add(existing.getId());
                                                matched = true;
                                                break;
                                        }
                                }

                                if (!matched) {
                                        ProRawMaterials rawMaterial = proRawMaterialsRepository
                                                        .findByIdAndTenant(req.getRawMaterialId(), tenant)
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Raw Material not found: "
                                                                                        + req.getRawMaterialId()));

                                        ProProcess process = null;
                                        if (req.getProcessId() != null) {
                                                process = proProcessRepository
                                                                .findByIdAndTenant(req.getProcessId(), tenant)
                                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                                "Process not found: " + req
                                                                                                .getProcessId()));
                                        }

                                        MaterialIssueDetail newDetail = MaterialIssueDetail.builder()
                                                        .materialIssue(materialIssue)
                                                        .rawMaterial(rawMaterial)
                                                        .process(process)
                                                        .issuedQuantity(req.getIssuedQuantity())
                                                        .build();

                                        // Hanger Phase 3: Coil Deduction for new details
                                        if (req.getCoilRefId() != null) {
                                                com.example.multi_tanent.hanger.entity.HngCoilStock coil = hngCoilStockRepository
                                                                .findById(req.getCoilRefId())
                                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                                "Coil not found: "
                                                                                                + req.getCoilRefId()));
                                                newDetail.setCoilRef(coil);
                                                newDetail.setIssuedWeightKg(req.getIssuedWeightKg());

                                                // Deduct weight from coil stock
                                                coil.issueWeight(req.getIssuedWeightKg());
                                                hngCoilStockRepository.save(coil);
                                        }

                                        // Handle stock deduction for new detail
                                        handleStockDeduction(tenant, rawMaterial, req.getIssuedQuantity(),
                                                        materialIssue.getMaterialRequisition(), req.getWarehouseId());

                                        detailsToAdd.add(newDetail);
                                }
                        }

                        // 2. Identify Orphans (details present in DB but not in Request)
                        currentDetails.removeIf(existing -> existing.getId() != null
                                        && !matchedDetailIds.contains(existing.getId()));

                        // 3. Add new ones
                        currentDetails.addAll(detailsToAdd);
                }

                MaterialIssue savedIssue = materialIssueRepository.saveAndFlush(materialIssue);

                // Force reload from DB to ensure all associations (EntityGraph/JoinFetch) are
                // active
                entityManager.detach(savedIssue);
                MaterialIssue refreshedIssue = materialIssueRepository.findByIdAndTenant(savedIssue.getId(), tenant)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Issue not found after update"));

                return MaterialIssueResponse.fromEntity(refreshedIssue);
        }

        @Override
        @Transactional(readOnly = true)
        public MaterialIssueResponse getById(Long id, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIssue materialIssue = materialIssueRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Issue not found"));

                return MaterialIssueResponse.fromEntity(materialIssue);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<MaterialIssueResponse> getAll(Pageable pageable, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                Page<MaterialIssue> issues = materialIssueRepository.findByTenant(tenant, pageable);
                return issues.map(MaterialIssueResponse::fromEntity);
        }

        @Override
        @Transactional
        public void delete(Long id, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIssue materialIssue = materialIssueRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Issue not found"));

                materialIssueRepository.delete(materialIssue);
        }

        /**
         * Deducts (or adds back if amount is negative) stock from ProRawMaterials
         * and logs a warehouse movement.
         */
        private void handleStockDeduction(Tenant tenant, ProRawMaterials rawMaterial,
                        java.math.BigDecimal amount, MaterialRequision requisition, Long warehouseId) {
                if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) == 0)
                        return;

                // 1. Update ProRawMaterials master stock
                java.math.BigDecimal currentStock = rawMaterial.getStockQuantity() != null
                                ? rawMaterial.getStockQuantity()
                                : java.math.BigDecimal.ZERO;
                rawMaterial.setStockQuantity(currentStock.subtract(amount));
                proRawMaterialsRepository.save(rawMaterial);

                // 2. Log Warehouse Movement (InventoryImprovement)
                WareHouse warehouse = null;
                if (warehouseId != null) {
                        warehouse = warehouseRepository.findById(warehouseId).orElse(null);
                }

                if (warehouse == null) {
                        warehouse = warehouseRepository.fetchByTenant(tenant)
                                        .stream().findFirst().orElse(null);
                }

                if (warehouse != null) {
                        InventoryImprovement movement = InventoryImprovement.builder()
                                        .movementNo("MOV-ISS-" + UUID.randomUUID().toString()
                                                        .substring(0, 8).toUpperCase())
                                        .type(amount.compareTo(java.math.BigDecimal.ZERO) > 0
                                                        ? MovementType.PRODUCTION_ISSUE
                                                        : MovementType.ADJUSTMENT_IN) // Revert if negative
                                        .status(StockStatus.AVAILABLE)
                                        .rawMaterial(rawMaterial)
                                        .warehouse(warehouse)
                                        .quantity(Math.abs(amount.doubleValue()))
                                        .qtyBefore(currentStock.doubleValue())
                                        .qtyAfter(rawMaterial.getStockQuantity().doubleValue())
                                        .referenceType(ReferenceType.PRODUCTION_ISSUE)
                                        .referenceId(requisition != null ? requisition.getId() : 0L)
                                        .enterprise(tenant)
                                        .movementAt(java.time.LocalDateTime.now())
                                        .remarks("Stock adjustment for requisition: "
                                                        + (requisition != null ? requisition.getRequestNo() : "N/A"))
                                        .build();
                        inventoryImprovementRepository.save(movement);
                }
        }
}
