package com.example.multi_tanent.materials.service.impl;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.materials.dto.MaterialRequisionResponse;
import com.example.multi_tanent.materials.entity.MaterialRequision;
import com.example.multi_tanent.materials.enums.IndentStatus;
import com.example.multi_tanent.materials.enums.MaterialRequisitionStatus;
import com.example.multi_tanent.materials.enums.RequisitionType;
import com.example.multi_tanent.materials.enums.ReserveStatus;
import com.example.multi_tanent.materials.repository.MaterialRequisionRepository;
import com.example.multi_tanent.materials.repository.MaterialRequisionSpecification;
import com.example.multi_tanent.materials.service.MaterialRequisionService;
import com.example.multi_tanent.production.entity.ManufacturingOrder;
import com.example.multi_tanent.production.repository.ManufacturingOrderRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class MaterialRequisionServiceImpl implements MaterialRequisionService {

        private final MaterialRequisionRepository repository;
        private final TenantRepository tenantRepository;
        private final ManufacturingOrderRepository manufacturingOrderRepository;
        private final com.example.multi_tanent.materials.repository.MaterialIssueRepository issueRepository;
        private final com.example.multi_tanent.materials.repository.MaterialIndentRepository indentRepository;
        private final com.example.multi_tanent.materials.repository.MaterialReservationRepository reservationRepository;

        private Tenant getCurrentTenant() {
                String tenantId = TenantContext.getTenantId();
                return tenantRepository.findByTenantId(tenantId)
                                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
        }

        @Override
        public void createRequisitionFromMO(ManufacturingOrder mo) {
                // Double check if already exists to be safe
                if (repository.existsByManufacturingOrderId(mo.getId())) {
                        return;
                }

                // Generate Request Number
                String requestNo = "MREQ-" + System.currentTimeMillis() + "-" + mo.getId();

                MaterialRequision requisition = MaterialRequision.builder()
                                .tenant(mo.getTenant())
                                .requestNo(requestNo)
                                .requestDate(LocalDate.now())
                                .manufacturingOrder(mo)
                                .employee(mo.getAssignTo())
                                .status(MaterialRequisitionStatus.FIRST_APPROVAL_PENDING)
                                .location(mo.getProductionHouse())
                                .indentStatus(IndentStatus.PENDING)
                                .reserveStatus(ReserveStatus.PENDING)
                                .materialStatus(com.example.multi_tanent.materials.enums.MaterialStatus.PENDING)
                                .requisitionFor(RequisitionType.RAW_MATERIALS)
                                .extraRequisition(false)
                                .remarks("Auto-generated from MO: " + mo.getMoNumber())
                                .build();

                MaterialRequision savedRequisition = repository.save(requisition);

                // --- 1. Create Material Issue Header (Draft/Pending) ---
                com.example.multi_tanent.materials.entity.MaterialIssue issue = com.example.multi_tanent.materials.entity.MaterialIssue
                                .builder()
                                .tenant(mo.getTenant())
                                .issueNo("ISSUE-" + System.currentTimeMillis() + "-" + mo.getId())
                                .issueDate(LocalDate.now())
                                .materialRequisition(savedRequisition)
                                .remarks("Auto-generated from Requisition: " + requestNo)
                                .details(new java.util.ArrayList<>())
                                .build();

                // --- 2. Create Material Indent Header (Draft/Pending) ---
                com.example.multi_tanent.materials.entity.MaterialIndent indent = com.example.multi_tanent.materials.entity.MaterialIndent
                                .builder()
                                .tenant(mo.getTenant())
                                .indentNo("INDENT-" + System.currentTimeMillis() + "-" + mo.getId())
                                .indentDate(LocalDate.now())
                                .materialRequisition(savedRequisition)
                                .location(mo.getProductionHouse())
                                .status(IndentStatus.PENDING)
                                .remarks("Auto-generated from Requisition: " + requestNo)
                                .details(new java.util.ArrayList<>())
                                .build();

                // --- 3. Create Material Reservation Header (Draft/Pending) ---
                com.example.multi_tanent.materials.entity.MaterialReservation reservation = com.example.multi_tanent.materials.entity.MaterialReservation
                                .builder()
                                .tenant(mo.getTenant())
                                .reservationNo("RESERV-" + System.currentTimeMillis() + "-" + mo.getId())
                                .reservationDate(LocalDate.now())
                                .materialRequisition(savedRequisition)
                                .status(ReserveStatus.PENDING)
                                .remarks("Auto-generated from Requisition: " + requestNo)
                                .details(new java.util.ArrayList<>())
                                .build();

                // Populate details from BOM if available
                com.example.multi_tanent.production.entity.BomSemiFinished bom = mo.getBom();
                com.example.multi_tanent.production.entity.BomFinishedGood bomFinishedGood = mo.getBomFinishedGood();

                if (bom != null && bom.getDetails() != null) {
                        java.math.BigDecimal moQuantity = mo.getQuantity() != null ? mo.getQuantity()
                                        : java.math.BigDecimal.ONE;

                        for (com.example.multi_tanent.production.entity.BomSemiFinishedDetail bomDetail : bom
                                        .getDetails()) {
                                // We are only creating details for Raw Materials as per
                                // RequisitionType.RAW_MATERIALS
                                if (bomDetail.getRawMaterial() != null) {
                                        java.math.BigDecimal requiredQty = bomDetail.getQuantity().multiply(moQuantity);
                                        createDetails(issue, indent, reservation, bomDetail.getRawMaterial(),
                                                        bomDetail.getProcess(), requiredQty);
                                }
                        }
                } else if (bomFinishedGood != null && bomFinishedGood.getDetails() != null) {
                        java.math.BigDecimal moQuantity = mo.getQuantity() != null ? mo.getQuantity()
                                        : java.math.BigDecimal.ONE;

                        for (com.example.multi_tanent.production.entity.BomFinishedGoodDetail bomDetail : bomFinishedGood
                                        .getDetails()) {
                                // We are only creating details for Raw Materials as per
                                // RequisitionType.RAW_MATERIALS
                                if (bomDetail.getRawMaterial() != null) {
                                        java.math.BigDecimal requiredQty = bomDetail.getQuantity().multiply(moQuantity);
                                        createDetails(issue, indent, reservation, bomDetail.getRawMaterial(),
                                                        bomDetail.getProcess(), requiredQty);
                                }
                        }
                }

                issueRepository.save(issue);
                indentRepository.save(indent);
                reservationRepository.save(reservation);
        }

        private void createDetails(
                        com.example.multi_tanent.materials.entity.MaterialIssue issue,
                        com.example.multi_tanent.materials.entity.MaterialIndent indent,
                        com.example.multi_tanent.materials.entity.MaterialReservation reservation,
                        com.example.multi_tanent.production.entity.ProRawMaterials rawMaterial,
                        com.example.multi_tanent.production.entity.ProProcess process,
                        java.math.BigDecimal requiredQty) {
                // Issue Detail
                com.example.multi_tanent.materials.entity.MaterialIssueDetail issueDetail = com.example.multi_tanent.materials.entity.MaterialIssueDetail
                                .builder()
                                .materialIssue(issue)
                                .rawMaterial(rawMaterial)
                                .process(process)
                                .issuedQuantity(java.math.BigDecimal.ZERO)
                                .build();
                issue.getDetails().add(issueDetail);

                // Indent Detail
                com.example.multi_tanent.materials.entity.MaterialIndentDetail indentDetail = com.example.multi_tanent.materials.entity.MaterialIndentDetail
                                .builder()
                                .materialIndent(indent)
                                .rawMaterial(rawMaterial)
                                .process(process)
                                .indentQuantity(java.math.BigDecimal.ZERO)
                                .build();
                indent.getDetails().add(indentDetail);

                // Reservation Detail
                com.example.multi_tanent.materials.entity.MaterialReservationDetail reservationDetail = com.example.multi_tanent.materials.entity.MaterialReservationDetail
                                .builder()
                                .materialReservation(reservation)
                                .rawMaterial(rawMaterial)
                                .process(process)
                                .reservedQuantity(java.math.BigDecimal.ZERO)
                                .build();
                reservation.getDetails().add(reservationDetail);
        }

        @Override
        @Transactional(value = "tenantTx", readOnly = true)
        public Page<MaterialRequisionResponse> getAll(Pageable pageable, String search, LocalDate fromDate,
                        LocalDate toDate) {
                Long tenantId = getCurrentTenant().getId();
                Specification<MaterialRequision> spec = MaterialRequisionSpecification.getSpecifications(tenantId,
                                search, fromDate, toDate);
                return repository.findAll(spec, pageable)
                                .map(MaterialRequisionResponse::fromEntity);
        }

        @Override
        @Transactional(value = "tenantTx", readOnly = true)
        public MaterialRequisionResponse getById(Long id) {
                Long tenantId = getCurrentTenant().getId();
                MaterialRequision entity = repository.findByTenantIdAndId(tenantId, id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Requisition not found with id: " + id));
                return MaterialRequisionResponse.fromEntity(entity);
        }

        @Override
        @Transactional(value = "tenantTx", readOnly = true)
        public MaterialRequisionResponse getByManufacturingOrderId(Long moId) {
                Long tenantId = getCurrentTenant().getId();
                MaterialRequision entity = repository.findByTenantIdAndManufacturingOrderId(tenantId, moId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Requisition not found for Manufacturing Order id: " + moId));
                return MaterialRequisionResponse.fromEntity(entity);
        }

        @Override
        public MaterialRequisionResponse updateStatus(Long id, MaterialRequisitionStatus status) {
                Long tenantId = getCurrentTenant().getId();
                MaterialRequision entity = repository.findByTenantIdAndId(tenantId, id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Requisition not found with id: " + id));
                entity.setStatus(status);
                return MaterialRequisionResponse.fromEntity(repository.save(entity));
        }

        @Override
        public MaterialRequisionResponse updateMaterialStatus(Long id,
                        com.example.multi_tanent.materials.enums.MaterialStatus status) {
                Long tenantId = getCurrentTenant().getId();
                MaterialRequision entity = repository.findByTenantIdAndId(tenantId, id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Requisition not found with id: " + id));
                entity.setMaterialStatus(status);
                return MaterialRequisionResponse.fromEntity(repository.save(entity));
        }

        @Override
        public MaterialRequisionResponse updateIndentStatus(Long id, IndentStatus status) {
                Long tenantId = getCurrentTenant().getId();
                MaterialRequision entity = repository.findByTenantIdAndId(tenantId, id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Requisition not found with id: " + id));
                entity.setIndentStatus(status);
                return MaterialRequisionResponse.fromEntity(repository.save(entity));
        }

        @Override
        public MaterialRequisionResponse updateReserveStatus(Long id, ReserveStatus status) {
                Long tenantId = getCurrentTenant().getId();
                MaterialRequision entity = repository.findByTenantIdAndId(tenantId, id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Requisition not found with id: " + id));
                entity.setReserveStatus(status);
                return MaterialRequisionResponse.fromEntity(repository.save(entity));
        }

        @Override
        public void generateMissingRequisitions() {
                Long tenantId = getCurrentTenant().getId();
                List<ManufacturingOrder> allMos = manufacturingOrderRepository.findByTenantId(tenantId);

                for (ManufacturingOrder mo : allMos) {
                        if (!repository.existsByManufacturingOrderId(mo.getId())) {
                                createRequisitionFromMO(mo);
                        }
                }
        }
}
