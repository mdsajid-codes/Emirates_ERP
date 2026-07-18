package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.dto.HngCoatingLogRequest;
import com.example.multi_tanent.hanger.dto.HngCoatingLogResponse;
import com.example.multi_tanent.hanger.entity.*;
import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
import com.example.multi_tanent.hanger.repository.HngCoatingLogRepository;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.hanger.repository.HngScrapEntryRepository;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class HngCoatingLogService {

    private final HngCoatingLogRepository coatingLogRepo;
    private final HngProductionBatchRepository batchRepo;
    private final HngScrapEntryRepository scrapRepo;
    private final ProWorkStationRepository workstationRepo;
    private final EmployeeRepository employeeRepo;
    private final TenantRepository tenantRepo;
    private final HngCoatingLogNumberGenerator numberGenerator;

    private Tenant currentTenant() {
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved"));
    }

    public HngCoatingLogResponse create(HngCoatingLogRequest req) {
        Tenant t = currentTenant();

        HngProductionBatch batch = batchRepo.findByIdAndTenantId(req.getBatchId(), t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found: " + req.getBatchId()));

        if (batch.getCurrentStage() == BatchStage.WIRE_CUTTING) {
            throw new IllegalStateException(
                    "Batch has not completed bending yet. Current stage: " + batch.getCurrentStage());
        }

        HngCoatingLog log = HngCoatingLog.builder()
                .tenant(t)
                .batch(batch)
                .coatingLogNo(numberGenerator.generate(t.getId()))
                .coatingType(req.getCoatingType())
                .colorCode(req.getColorCode())
                .shift(req.getShift())
                .inputQty(req.getInputQty())
                .producedQty(req.getProducedQty())
                .rejectedQty(req.getRejectedQty() != null ? req.getRejectedQty() : 0)
                .reworkQty(req.getReworkQty() != null ? req.getReworkQty() : 0)
                .paintConsumedKg(req.getPaintConsumedKg())
                .chemicalBatch(req.getChemicalBatch())
                .temperatureC(req.getTemperatureC())
                .coatingThicknessMm(req.getCoatingThicknessMm())
                .durationMin(req.getDurationMin())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .remarks(req.getRemarks())
                .build();

        if (req.getWorkstationId() != null) {
            log.setWorkstation(workstationRepo.findById(req.getWorkstationId()).orElse(null));
        }
        if (req.getOperatorId() != null) {
            log.setOperator(employeeRepo.findById(req.getOperatorId()).orElse(null));
        }

        // Calculate quality percentage
        calculateQuality(log, batch.getHangerType());

        HngCoatingLog saved = coatingLogRepo.save(log);

        // Auto-create scrap entry if rejectedQty > 0
        if (log.getRejectedQty() > 0) {
            BigDecimal unitWeightKg = batch.getHangerType().getUnitWeightGrams()
                    .divide(new BigDecimal("1000"), 4, RoundingMode.HALF_UP);

            HngScrapEntry scrap = HngScrapEntry.builder()
                    .tenant(t)
                    .batch(batch)
                    .coatingLog(saved)
                    .stage(ScrapStage.COATING)
                    .scrapType(ScrapType.NON_RETURNABLE)
                    .scrapWeightKg(unitWeightKg.multiply(new BigDecimal(log.getRejectedQty())))
                    .remarks("Auto-created from Coating Log: " + saved.getCoatingLogNo())
                    .build();

            scrapRepo.save(scrap);
        }

        // Update batch stage to COATING if it's currently BENDING
        if (batch.getCurrentStage() == BatchStage.BENDING) {
            batch.setCurrentStage(BatchStage.COATING);
            batchRepo.save(batch);
        }

        return toResponse(saved);
    }

    private void calculateQuality(HngCoatingLog log, HangerType ht) {
        if (log.getInputQty() == null || log.getInputQty() == 0) {
            log.setColorPass(true);
            return;
        }

        int rejected = log.getRejectedQty() != null ? log.getRejectedQty() : 0;
        BigDecimal rejectionPct = new BigDecimal(rejected)
                .multiply(new BigDecimal("100"))
                .divide(new BigDecimal(log.getInputQty()), 2, RoundingMode.HALF_UP);

        BigDecimal maxDefect = ht != null && ht.getMaxDefectPct() != null ? ht.getMaxDefectPct()
                : new BigDecimal("2.00");
        log.setColorPass(rejectionPct.compareTo(maxDefect) <= 0);
    }

    public List<HngCoatingLogResponse> getByBatch(Long batchId) {
        Tenant t = currentTenant();
        return coatingLogRepo.findByBatchIdAndTenantId(batchId, t.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private HngCoatingLogResponse toResponse(HngCoatingLog log) {
        BigDecimal rejectionPct = BigDecimal.ZERO;
        if (log.getInputQty() != null && log.getInputQty() > 0 && log.getRejectedQty() != null) {
            rejectionPct = new BigDecimal(log.getRejectedQty())
                    .multiply(new BigDecimal("100"))
                    .divide(new BigDecimal(log.getInputQty()), 2, RoundingMode.HALF_UP);
        }

        return HngCoatingLogResponse.builder()
                .id(log.getId())
                .batchId(log.getBatch().getId())
                .batchNo(log.getBatch().getBatchNo())
                .coatingLogNo(log.getCoatingLogNo())
                .coatingType(log.getCoatingType())
                .colorCode(log.getColorCode())
                .workstationId(log.getWorkstation() != null ? log.getWorkstation().getId() : null)
                .workstationName(log.getWorkstation() != null ? log.getWorkstation().getWorkstationName() : null)
                .operatorId(log.getOperator() != null ? log.getOperator().getId() : null)
                .operatorName(log.getOperator() != null ? log.getOperator().getName() : null)
                .shift(log.getShift())
                .inputQty(log.getInputQty())
                .producedQty(log.getProducedQty())
                .rejectedQty(log.getRejectedQty())
                .reworkQty(log.getReworkQty())
                .paintConsumedKg(log.getPaintConsumedKg())
                .chemicalBatch(log.getChemicalBatch())
                .temperatureC(log.getTemperatureC())
                .coatingThicknessMm(log.getCoatingThicknessMm())
                .durationMin(log.getDurationMin())
                .rejectionPct(rejectionPct)
                .colorPass(log.getColorPass())
                .startTime(log.getStartTime())
                .endTime(log.getEndTime())
                .remarks(log.getRemarks())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
