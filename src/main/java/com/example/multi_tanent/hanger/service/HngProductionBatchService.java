package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngBatchRequest;
import com.example.multi_tanent.hanger.dto.HngBatchResponse;
import com.example.multi_tanent.hanger.entity.HngCoilStock;
import com.example.multi_tanent.hanger.entity.HngProductionBatch;
import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.BatchStatus;
import com.example.multi_tanent.hanger.enums.PackingStatus;
import com.example.multi_tanent.hanger.repository.HangerTypeRepository;
import com.example.multi_tanent.hanger.repository.HngBatchPackingRepository;
import com.example.multi_tanent.hanger.repository.HngCoilStockRepository;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.production.entity.ManufacturingOrder;
import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.production.entity.ProWorkStation;
import com.example.multi_tanent.production.repository.ManufacturingOrderRepository;
import com.example.multi_tanent.production.repository.ProFinishedGoodRepository;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class HngProductionBatchService {

    private final HngProductionBatchRepository repo;
    private final HngBatchNumberGenerator numberGenerator;
    private final TenantRepository tenantRepo;
    private final ManufacturingOrderRepository moRepo;
    private final HngCoilStockRepository coilRepo;
    private final HangerTypeRepository hangerTypeRepo;
    private final ProWorkStationRepository workStationRepo;
    private final HngBatchPackingRepository packingRepo;
    private final ProFinishedGoodRepository finishedGoodRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public HngBatchResponse create(HngBatchRequest req) {
        Tenant t = currentTenant();

        ManufacturingOrder mo = moRepo.findByIdAndTenantId(req.getMoId(), t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Manufacturing Order not found: " + req.getMoId()));

        HngProductionBatch batch = HngProductionBatch.builder()
                .tenant(t)
                .batchNo(numberGenerator.generate(t.getId()))
                .mo(mo)
                .plannedQty(req.getPlannedQty())
                .shift(req.getShift())
                .remarks(req.getRemarks())
                .color(req.getColor())
                .status(BatchStatus.PENDING)
                .currentStage(BatchStage.WIRE_CUTTING)
                .build();

        if (req.getWorkStationId() != null) {
            ProWorkStation ws = workStationRepo.findById(req.getWorkStationId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Work Station not found: " + req.getWorkStationId()));
            batch.setWorkStation(ws);
        }

        if (req.getCoilRefId() != null) {
            HngCoilStock coil = coilRepo.findById(req.getCoilRefId())
                    .orElseThrow(() -> new EntityNotFoundException("Coil Stock not found: " + req.getCoilRefId()));
            batch.setCoilStock(coil);
        }

        if (req.getHangerTypeId() != null) {
            batch.setHangerType(hangerTypeRepo.findById(req.getHangerTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("Hanger Type not found: " + req.getHangerTypeId())));
        } else if (mo.getHangerType() != null) {
            batch.setHangerType(mo.getHangerType());
        }

        HngProductionBatch saved = repo.save(batch);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<HngBatchResponse> list(Pageable pageable) {
        Tenant t = currentTenant();
        return repo.findByTenantId(t.getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<HngBatchResponse> listByMo(Long moId) {
        Tenant t = currentTenant();
        return repo.findByMoIdAndTenantId(moId, t.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HngBatchResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    public HngProductionBatch getEntityById(Long id) {
        return repo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));
    }

    public HngBatchResponse advanceStage(Long id) {
        Tenant t = currentTenant();
        HngProductionBatch batch = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Production batch not found: " + id));

        if (batch.getStatus() == BatchStatus.PENDING || batch.getStatus() == BatchStatus.CANCELLED) {
            batch.setStatus(BatchStatus.IN_PROGRESS);
        }

        BatchStage current = batch.getCurrentStage();
        BatchStage next = current.next();

        if (next == null) {
            return toResponse(batch);
        }

        if (next == BatchStage.DONE) {
            batch.setStatus(BatchStatus.COMPLETED);
            batch.setCompletedAt(java.time.OffsetDateTime.now());
            // Default actualQty to plannedQty if not set
            if (batch.getActualQty() == null) {
                batch.setActualQty(batch.getPlannedQty());
            }
        }

        // Auto-confirm all DRAFT packing records → updates ProFinishedGood stock
        if (current == BatchStage.PACKING) {
            packingRepo.findByBatch_IdAndTenantId(id, t.getId()).forEach(packing -> {
                if (packing.getStatus() == PackingStatus.DRAFT) {
                    // Update FG stock quantity
                    if (batch.getHangerType() != null && batch.getHangerType().getFinishedGood() != null) {
                        ProFinishedGood fg = batch.getHangerType().getFinishedGood();
                        java.math.BigDecimal current2 = fg.getStockQuantity() != null
                                ? fg.getStockQuantity()
                                : java.math.BigDecimal.ZERO;
                        fg.setStockQuantity(current2.add(java.math.BigDecimal.valueOf(packing.getPackedQty())));
                        finishedGoodRepo.save(fg);
                    }
                    packing.setStatus(PackingStatus.PACKED);
                    packingRepo.save(packing);
                }
            });
        }

        batch.setCurrentStage(next);
        return toResponse(repo.save(batch));
    }

    @Transactional("tenantTx")
    public HngBatchResponse revertStage(Long id) {
        Tenant t = currentTenant();
        HngProductionBatch batch = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Production batch not found: " + id));

        if (batch.getStatus() == BatchStatus.COMPLETED || batch.getStatus() == BatchStatus.CANCELLED) {
            batch.setStatus(BatchStatus.IN_PROGRESS);
        }

        BatchStage current = batch.getCurrentStage();
        BatchStage prev = current.previous();

        batch.setCurrentStage(prev);
        return toResponse(repo.save(batch));
    }

    @Transactional("tenantTx")
    public HngBatchResponse cancel(Long id) {
        Tenant t = currentTenant();
        HngProductionBatch batch = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Production batch not found: " + id));
        batch.setStatus(BatchStatus.CANCELLED);
        return toResponse(repo.save(batch));
    }

    @Transactional(readOnly = true)
    public Map<BatchStage, List<HngBatchResponse>> getWipSummary() {
        Tenant t = currentTenant();
        List<HngProductionBatch> batches = repo.findByTenantIdAndStatusIn(
                t.getId(),
                List.of(BatchStatus.PENDING, BatchStatus.IN_PROGRESS));

        return batches.stream()
                .map(this::toResponse)
                .collect(Collectors.groupingBy(HngBatchResponse::getCurrentStage));
    }

    private HngBatchResponse toResponse(HngProductionBatch b) {
        return HngBatchResponse.builder()
                .id(b.getId())
                .tenantId(b.getTenant().getId())
                .batchNo(b.getBatchNo())
                .moId(b.getMo().getId())
                .moNumber(b.getMo().getMoNumber())
                .coilRefId(b.getCoilStock() != null ? b.getCoilStock().getId() : null)
                .coilNo(b.getCoilStock() != null ? b.getCoilStock().getCoilNo() : null)
                .hangerTypeId(b.getHangerType() != null ? b.getHangerType().getId() : null)
                .hangerTypeName(b.getHangerType() != null ? b.getHangerType().getTypeName().getLabel() : null)
                .color(b.getColor())
                .plannedQty(b.getPlannedQty())
                .shift(b.getShift())
                .workStationId(b.getWorkStation() != null ? b.getWorkStation().getId() : null)
                .workStationName(b.getWorkStation() != null ? b.getWorkStation().getWorkstationName() : null)
                .salesOrderId(b.getMo().getSalesOrder() != null ? b.getMo().getSalesOrder().getId() : null)
                .customerId(b.getMo().getCustomer() != null ? b.getMo().getCustomer().getId() : null)
                .status(b.getStatus())
                .currentStage(b.getCurrentStage())
                .remarks(b.getRemarks())
                .actualQty(b.getActualQty())
                .actualWireUsedKg(b.getActualWireUsedKg())
                .completedAt(b.getCompletedAt())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    @Transactional("tenantTx")
    public HngBatchResponse updateProductionFields(Long id, HngBatchRequest req) {
        Tenant t = currentTenant();
        HngProductionBatch batch = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Production batch not found: " + id));

        if (req.getActualQty() != null)
            batch.setActualQty(req.getActualQty());
        if (req.getActualWireUsedKg() != null)
            batch.setActualWireUsedKg(req.getActualWireUsedKg());

        return toResponse(repo.save(batch));
    }
}
