package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngWireProcessingRequest;
import com.example.multi_tanent.hanger.dto.HngWireProcessingResponse;
import com.example.multi_tanent.hanger.entity.HngBatchWireProcessing;
import com.example.multi_tanent.hanger.entity.HngProductionBatch;
import com.example.multi_tanent.hanger.entity.HngScrapEntry;
import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
import com.example.multi_tanent.hanger.repository.HngBatchWireProcessingRepository;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.hanger.repository.HngScrapEntryRepository;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class HngWireProcessingService {

    private final HngBatchWireProcessingRepository processingRepo;
    private final HngScrapEntryRepository scrapRepo;
    private final HngProductionBatchRepository batchRepo;
    private final ProWorkStationRepository workStationRepo;
    private final EmployeeRepository employeeRepo;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved"));
    }

    public HngWireProcessingResponse create(HngWireProcessingRequest req) {
        Tenant t = currentTenant();
        HngProductionBatch batch = batchRepo.findByIdAndTenantId(req.getBatchId(), t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found: " + req.getBatchId()));

        HngBatchWireProcessing processing = HngBatchWireProcessing.builder()
                .tenant(t)
                .batch(batch)
                .shift(req.getShift())
                .costCenter(req.getCostCenter())
                .cuttingLengthCm(req.getCuttingLengthCm())
                .plannedQty(batch.getPlannedQty())
                .producedQty(req.getProducedQty())
                .scrapQty(req.getScrapQty())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .remarks(req.getRemarks())
                .build();

        if (req.getWorkStationId() != null) {
            processing.setWorkStation(workStationRepo.findById(req.getWorkStationId()).orElse(null));
        }
        if (req.getOperatorId() != null) {
            processing.setOperator(employeeRepo.findById(req.getOperatorId()).orElse(null));
        }

        // Calculations
        if (req.getScrapQty() != null && batch.getHangerType() != null) {
            BigDecimal unitWeightKg = batch.getHangerType().getUnitWeightGrams().divide(new BigDecimal("1000"), 4,
                    RoundingMode.HALF_UP);
            processing.setScrapWeightKg(unitWeightKg.multiply(new BigDecimal(req.getScrapQty())));

            if (batch.getPlannedQty() != null && batch.getPlannedQty() > 0) {
                processing.setScrapPct(new BigDecimal(req.getScrapQty())
                        .multiply(new BigDecimal("100"))
                        .divide(new BigDecimal(batch.getPlannedQty()), 2, RoundingMode.HALF_UP));
            }
        }

        if (req.getStartTime() != null && req.getEndTime() != null && req.getProducedQty() != null) {
            long seconds = Duration.between(req.getStartTime(), req.getEndTime()).getSeconds();
            if (seconds > 0) {
                BigDecimal hours = new BigDecimal(seconds).divide(new BigDecimal("3600"), 4, RoundingMode.HALF_UP);
                processing.setProductivityPcsPerHour(
                        new BigDecimal(req.getProducedQty()).divide(hours, 2, RoundingMode.HALF_UP));
            }
        }

        HngBatchWireProcessing saved = processingRepo.save(processing);

        // Auto-create scrap entry if scrapQty > 0
        if (req.getScrapQty() != null && req.getScrapQty() > 0) {
            ScrapType st = ScrapType.NON_RETURNABLE;
            try {
                if (req.getScrapType() != null)
                    st = ScrapType.valueOf(req.getScrapType());
            } catch (Exception e) {
            }

            HngScrapEntry scrap = HngScrapEntry.builder()
                    .tenant(t)
                    .batch(batch)
                    .wireProcessing(saved)
                    .stage(ScrapStage.WIRE_CUTTING)
                    .scrapType(st)
                    .scrapWeightKg(saved.getScrapWeightKg())
                    .ratePerKg(req.getScrapRatePerKg())
                    .build();

            if (scrap.getScrapWeightKg() != null && scrap.getRatePerKg() != null) {
                scrap.setScrapValue(scrap.getScrapWeightKg().multiply(scrap.getRatePerKg()));
            }
            scrapRepo.save(scrap);
        }

        return toProcessingResponse(saved);
    }

    public List<HngWireProcessingResponse> getByBatch(Long batchId) {
        Tenant t = currentTenant();
        return processingRepo.findByBatchIdAndTenantId(batchId, t.getId()).stream()
                .map(this::toProcessingResponse)
                .collect(Collectors.toList());
    }

    private HngWireProcessingResponse toProcessingResponse(HngBatchWireProcessing p) {
        return HngWireProcessingResponse.builder()
                .id(p.getId())
                .batchId(p.getBatch().getId())
                .batchNo(p.getBatch().getBatchNo())
                .workStationId(p.getWorkStation() != null ? p.getWorkStation().getId() : null)
                .workStationName(p.getWorkStation() != null ? p.getWorkStation().getWorkstationName() : null)
                .operatorId(p.getOperator() != null ? p.getOperator().getId() : null)
                .operatorName(p.getOperator() != null ? p.getOperator().getName() : null)
                .shift(p.getShift())
                .costCenter(p.getCostCenter())
                .cuttingLengthCm(p.getCuttingLengthCm())
                .plannedQty(p.getPlannedQty())
                .producedQty(p.getProducedQty())
                .scrapQty(p.getScrapQty())
                .scrapWeightKg(p.getScrapWeightKg())
                .scrapPct(p.getScrapPct())
                .productivityPcsPerHour(p.getProductivityPcsPerHour())
                .startTime(p.getStartTime())
                .endTime(p.getEndTime())
                .remarks(p.getRemarks())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
