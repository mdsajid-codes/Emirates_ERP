package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngQcLogRequest;
import com.example.multi_tanent.hanger.dto.HngQcLogResponse;
import com.example.multi_tanent.hanger.entity.*;
import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.BatchStatus;
import com.example.multi_tanent.hanger.enums.QcResult;
import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.hanger.repository.HngQcLogRepository;
import com.example.multi_tanent.hanger.repository.HngScrapEntryRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HngQcLogService {

    private final HngQcLogRepository qcRepo;
    private final HngProductionBatchRepository batchRepo;
    private final EmployeeRepository employeeRepo;
    private final TenantRepository tenantRepo;
    private final HngQcLogNumberGenerator numberGenerator;
    private final HngScrapEntryRepository scrapRepo;

    private Long getCurrentTenantId() {
        String slug = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(slug)
                .map(Tenant::getId)
                .orElseThrow(() -> new RuntimeException("Tenant not resolved for slug: " + slug));
    }

    @Transactional
    public HngQcLogResponse createQcLog(HngQcLogRequest request) {
        Long tenantId = getCurrentTenantId();
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        HngProductionBatch batch = batchRepo.findByIdAndTenantId(request.getBatchId(), tenantId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Employee inspector = null;
        if (request.getInspectorId() != null) {
            inspector = employeeRepo.findById(request.getInspectorId())
                    .orElseThrow(() -> new RuntimeException("Inspector not found"));
        }

        // Calculate defect percentage
        BigDecimal defectPct = BigDecimal.ZERO;
        if (request.getInspectedQty() != null && request.getInspectedQty() > 0) {
            defectPct = BigDecimal.valueOf(request.getRejectedQty())
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(request.getInspectedQty()), 2, RoundingMode.HALF_UP);
        }

        // Logic check: If defectPct > maxDefectPct but user passed it, we might want to
        // flag it
        // However, we follow the user's manual result for now as per plan.

        HngQcLog qcLog = HngQcLog.builder()
                .tenant(tenant)
                .batch(batch)
                .qcLogNo(numberGenerator.generate(tenantId))
                .inspector(inspector)
                .sampleSize(request.getSampleSize())
                .inspectedQty(request.getInspectedQty())
                .passedQty(request.getPassedQty())
                .rejectedQty(request.getRejectedQty())
                .reworkQty(request.getReworkQty())
                .defectType(request.getDefectType())
                .qcResult(request.getQcResult())
                .defectPct(defectPct)
                .loadTestPassed(request.getLoadTestPassed())
                .remarks(request.getRemarks())
                .scrapReasonCode(request.getScrapReasonCode())
                .materialWeightLost(request.getMaterialWeightLost())
                .testType(request.getTestType())
                .measuredValue(request.getMeasuredValue())
                .build();

        qcLog = qcRepo.save(qcLog);

        // Auto-Scrap Generation
        if (request.getRejectedQty() != null && request.getRejectedQty() > 0) {
            HngScrapEntry scrap = HngScrapEntry.builder()
                    .tenant(tenant)
                    .batch(batch)
                    .qcLog(qcLog)
                    .scrapWeightKg(BigDecimal.valueOf(request.getRejectedQty()))
                    .stage(ScrapStage.QC)
                    .scrapType(ScrapType.NON_RETURNABLE)
                    .remarks("Auto-generated from QC Log: " + qcLog.getQcLogNo())
                    .build();
            scrapRepo.save(scrap);
        }

        // Update Batch Stage if it's currently at COATING (meaning it just entered QC)
        if (batch.getCurrentStage() == BatchStage.COATING) {
            batch.setCurrentStage(BatchStage.QC);
            batchRepo.save(batch);
        }

        return mapToResponse(qcLog);
    }

    public List<HngQcLogResponse> getLogsByBatch(Long batchId) {
        Long tenantId = getCurrentTenantId();
        return qcRepo.findByBatch_IdAndTenantId(batchId, tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void completeBatch(Long batchId) {
        Long tenantId = getCurrentTenantId();
        HngProductionBatch batch = batchRepo.findByIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (batch.getStatus() == BatchStatus.COMPLETED) {
            throw new RuntimeException("Batch is already completed");
        }

        // Verify that there is at least one PASS or CONDITIONAL_PASS log
        List<HngQcLog> logs = qcRepo.findByBatch_IdAndTenantId(batchId, tenantId);
        boolean hasPassed = logs.stream()
                .anyMatch(l -> l.getQcResult() == QcResult.PASS || l.getQcResult() == QcResult.CONDITIONAL_PASS);

        if (!hasPassed) {
            throw new RuntimeException("Batch cannot be completed without a PASS or CONDITIONAL_PASS QC result");
        }

        batch.setStatus(BatchStatus.COMPLETED);
        batch.setCurrentStage(BatchStage.DONE);
        batch.setUpdatedAt(OffsetDateTime.now());
        batchRepo.save(batch);
    }

    private HngQcLogResponse mapToResponse(HngQcLog log) {
        return HngQcLogResponse.builder()
                .id(log.getId())
                .qcLogNo(log.getQcLogNo())
                .batchId(log.getBatch().getId())
                .batchNo(log.getBatch().getBatchNo())
                .inspectorId(log.getInspector() != null ? log.getInspector().getId() : null)
                .inspectorName(log.getInspector() != null
                        ? log.getInspector().getFirstName() + " " + log.getInspector().getLastName()
                        : "Unknown")
                .sampleSize(log.getSampleSize())
                .inspectedQty(log.getInspectedQty())
                .passedQty(log.getPassedQty())
                .rejectedQty(log.getRejectedQty())
                .reworkQty(log.getReworkQty())
                .defectType(log.getDefectType())
                .qcResult(log.getQcResult())
                .defectPct(log.getDefectPct())
                .loadTestPassed(log.getLoadTestPassed())
                .remarks(log.getRemarks())
                .scrapReasonCode(log.getScrapReasonCode())
                .materialWeightLost(log.getMaterialWeightLost())
                .testType(log.getTestType())
                .measuredValue(log.getMeasuredValue())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
