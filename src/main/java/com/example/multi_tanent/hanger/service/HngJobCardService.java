package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.dto.HngJobCardRequest;
import com.example.multi_tanent.hanger.dto.HngJobCardResponse;
import com.example.multi_tanent.hanger.dto.HngOeeResponse;
import com.example.multi_tanent.hanger.entity.*;
import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
import com.example.multi_tanent.hanger.repository.HngJobCardRepository;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.hanger.repository.HngScrapEntryRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
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
public class HngJobCardService {

        private final HngJobCardRepository jobCardRepo;
        private final HngProductionBatchRepository batchRepo;
        private final HngScrapEntryRepository scrapRepo;
        private final EmployeeRepository employeeRepo;
        private final TenantRepository tenantRepo;
        private final HngJobCardNumberGenerator numberGenerator;
        private final ProWorkStationRepository workstationRepo;

        private Tenant currentTenant() {
                return tenantRepo.findFirstByOrderByIdAsc()
                                .orElseThrow(() -> new IllegalStateException("Tenant not resolved"));
        }

        public HngJobCardResponse create(HngJobCardRequest req) {
                Tenant t = currentTenant();
                HngProductionBatch batch = batchRepo.findByIdAndTenantId(req.getBatchId(), t.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Batch not found: " + req.getBatchId()));

                HngJobCard jobCard = HngJobCard.builder()
                                .tenant(t)
                                .batch(batch)
                                .jobCardNo(numberGenerator.generate(t.getId()))
                                .workstation(req.getWorkstationId() != null
                                                ? workstationRepo.findById(req.getWorkstationId()).orElse(null)
                                                : null)
                                .toolDieNo(req.getToolDieNo())
                                .shift(req.getShift())
                                .plannedQty(batch.getPlannedQty())
                                .targetQty(req.getTargetQty())
                                .producedQty(req.getProducedQty())
                                .rejectedQty(req.getRejectedQty())
                                .reworkQty(req.getReworkQty())
                                .laborHours(req.getLaborHours())
                                .workstationRunHours(req.getWorkstationRunHours())
                                .breakdownTime(req.getBreakdownTime())
                                .actualShoulderWidthMm(req.getActualShoulderWidthMm())
                                .actualHookSizeMm(req.getActualHookSizeMm())
                                .startTime(req.getStartTime())
                                .endTime(req.getEndTime())
                                .remarks(req.getRemarks())
                                .build();

                if (req.getOperatorId() != null) {
                        jobCard.setOperator(employeeRepo.findById(req.getOperatorId()).orElse(null));
                }

                calculateMetrics(jobCard, batch.getHangerType());

                HngJobCard saved = jobCardRepo.save(jobCard);

                // Auto-create scrap entry if rejectedQty > 0
                if (req.getRejectedQty() != null && req.getRejectedQty() > 0) {
                        BigDecimal unitWeightKg = batch.getHangerType().getUnitWeightGrams()
                                        .divide(new BigDecimal("1000"), 4, RoundingMode.HALF_UP);

                        HngScrapEntry scrap = HngScrapEntry.builder()
                                        .tenant(t)
                                        .batch(batch)
                                        .stage(ScrapStage.BENDING)
                                        .scrapType(ScrapType.NON_RETURNABLE)
                                        .scrapWeightKg(unitWeightKg.multiply(new BigDecimal(req.getRejectedQty())))
                                        .remarks("Auto-created from Job Card: " + saved.getJobCardNo())
                                        .build();

                        scrapRepo.save(scrap);
                }

                return toResponse(saved);
        }

        private void calculateMetrics(HngJobCard jc, HangerType ht) {
                if (jc.getProducedQty() == null || jc.getProducedQty() == 0)
                        return;
                if (jc.getWorkstationRunHours() == null || jc.getWorkstationRunHours().compareTo(BigDecimal.ZERO) == 0)
                        return;

                // 1. Cycle Time Sec
                BigDecimal runHrs = jc.getWorkstationRunHours();
                BigDecimal runSeconds = runHrs.multiply(new BigDecimal("3600"));
                jc.setCycleTimeSec(runSeconds.divide(new BigDecimal(jc.getProducedQty()), 2, RoundingMode.HALF_UP));

                // 2. Availability %
                BigDecimal breakdown = jc.getBreakdownTime() != null ? jc.getBreakdownTime() : BigDecimal.ZERO;
                BigDecimal uptime = runHrs.subtract(breakdown);
                jc.setAvailabilityPct(uptime.multiply(new BigDecimal("100"))
                                .divide(jc.getWorkstationRunHours(), 2, RoundingMode.HALF_UP));

                // 3. Performance %
                if (ht != null && ht.getStandardCycleTimeSec() != null
                                && ht.getStandardCycleTimeSec().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal theoreticalMax = uptime.multiply(new BigDecimal("3600"))
                                        .divide(ht.getStandardCycleTimeSec(), 2, RoundingMode.HALF_UP);
                        if (theoreticalMax.compareTo(BigDecimal.ZERO) > 0) {
                                jc.setPerformancePct(new BigDecimal(jc.getProducedQty()).multiply(new BigDecimal("100"))
                                                .divide(theoreticalMax, 2, RoundingMode.HALF_UP));
                        }
                }

                // 4. Quality %
                int rejected = jc.getRejectedQty() != null ? jc.getRejectedQty() : 0;
                BigDecimal goodQty = new BigDecimal(jc.getProducedQty() - rejected);
                jc.setQualityPct(goodQty.multiply(new BigDecimal("100"))
                                .divide(new BigDecimal(jc.getProducedQty()), 2, RoundingMode.HALF_UP));

                // 5. OEE %
                if (jc.getAvailabilityPct() != null && jc.getPerformancePct() != null && jc.getQualityPct() != null) {
                        jc.setOeePct(jc.getAvailabilityPct()
                                        .multiply(jc.getPerformancePct())
                                        .multiply(jc.getQualityPct())
                                        .divide(new BigDecimal("10000"), 2, RoundingMode.HALF_UP));
                }

                // 6. Dimension Pass
                if (ht != null && jc.getActualShoulderWidthMm() != null && jc.getActualHookSizeMm() != null) {
                        BigDecimal targetWidthMm = ht.getStandardWidthCm().multiply(BigDecimal.TEN);
                        BigDecimal targetHookMm = ht.getStandardHookCm().multiply(BigDecimal.TEN);

                        boolean widthOk = jc.getActualShoulderWidthMm().subtract(targetWidthMm).abs()
                                        .compareTo(ht.getShoulderWidthToleranceMm()) <= 0;
                        boolean hookOk = jc.getActualHookSizeMm().subtract(targetHookMm).abs()
                                        .compareTo(ht.getHookSizeToleranceMm()) <= 0;

                        jc.setDimensionPass(widthOk && hookOk);
                }
        }

        @Transactional(readOnly = true)
        public HngOeeResponse getOeeSummary() {
                Tenant t = currentTenant();
                List<HngJobCard> jobCards = jobCardRepo.findByTenantId(t.getId());

                if (jobCards.isEmpty()) {
                        return HngOeeResponse.builder()
                                        .avgAvailability(BigDecimal.ZERO)
                                        .avgPerformance(BigDecimal.ZERO)
                                        .avgQuality(BigDecimal.ZERO)
                                        .avgOee(BigDecimal.ZERO)
                                        .batches(List.of())
                                        .build();
                }

                BigDecimal totalAvailability = BigDecimal.ZERO;
                BigDecimal totalPerformance = BigDecimal.ZERO;
                BigDecimal totalQuality = BigDecimal.ZERO;
                BigDecimal totalOee = BigDecimal.ZERO;
                int countAvail = 0, countPerf = 0, countQual = 0, countOee = 0;
                int totalProduced = 0, totalRejected = 0;

                List<HngOeeResponse.BatchOeeItem> items = jobCards.stream().map(jc -> {
                        if (jc.getAvailabilityPct() != null) {
                                // totalAvailability = totalAvailability.add(jc.getAvailabilityPct()); // Won't
                                // work in lambda
                        }
                        return HngOeeResponse.BatchOeeItem.builder()
                                        .batchId(jc.getBatch().getId())
                                        .batchNo(jc.getBatch().getBatchNo())
                                        .jobCardNo(jc.getJobCardNo())
                                        .availability(jc.getAvailabilityPct())
                                        .performance(jc.getPerformancePct())
                                        .quality(jc.getQualityPct())
                                        .oee(jc.getOeePct())
                                        .producedQty(jc.getProducedQty())
                                        .rejectedQty(jc.getRejectedQty())
                                        .createdAt(jc.getCreatedAt())
                                        .build();
                }).collect(Collectors.toList());

                // Calculate averages outside lambda to avoid effectively final issues or use a
                // wrapper
                for (HngJobCard jc : jobCards) {
                        if (jc.getAvailabilityPct() != null) {
                                totalAvailability = totalAvailability.add(jc.getAvailabilityPct());
                                countAvail++;
                        }
                        if (jc.getPerformancePct() != null) {
                                totalPerformance = totalPerformance.add(jc.getPerformancePct());
                                countPerf++;
                        }
                        if (jc.getQualityPct() != null) {
                                totalQuality = totalQuality.add(jc.getQualityPct());
                                countQual++;
                        }
                        if (jc.getOeePct() != null) {
                                totalOee = totalOee.add(jc.getOeePct());
                                countOee++;
                        }
                        totalProduced += (jc.getProducedQty() != null ? jc.getProducedQty() : 0);
                        totalRejected += (jc.getRejectedQty() != null ? jc.getRejectedQty() : 0);
                }

                return HngOeeResponse.builder()
                                .avgAvailability(countAvail > 0 ? totalAvailability.divide(new BigDecimal(countAvail),
                                                2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                                .avgPerformance(countPerf > 0
                                                ? totalPerformance.divide(new BigDecimal(countPerf), 2,
                                                                RoundingMode.HALF_UP)
                                                : BigDecimal.ZERO)
                                .avgQuality(countQual > 0
                                                ? totalQuality.divide(new BigDecimal(countQual), 2,
                                                                RoundingMode.HALF_UP)
                                                : BigDecimal.ZERO)
                                .avgOee(countOee > 0
                                                ? totalOee.divide(new BigDecimal(countOee), 2, RoundingMode.HALF_UP)
                                                : BigDecimal.ZERO)
                                .totalJobCards(jobCards.size())
                                .totalProducedQty(totalProduced)
                                .totalRejectedQty(totalRejected)
                                .batches(items)
                                .build();
        }

        public List<HngJobCardResponse> getByBatch(Long batchId) {
                Tenant t = currentTenant();
                return jobCardRepo.findByBatchIdAndTenantId(batchId, t.getId()).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        public HngJobCard getById(Long id) {
                return jobCardRepo.findByIdAndTenantId(id, currentTenant().getId())
                                .orElseThrow(() -> new RuntimeException("Job Card not found"));
        }

        private HngJobCardResponse toResponse(HngJobCard jc) {
                return HngJobCardResponse.builder()
                                .id(jc.getId())
                                .batchId(jc.getBatch().getId())
                                .batchNo(jc.getBatch().getBatchNo())
                                .jobCardNo(jc.getJobCardNo())
                                .workstationId(jc.getWorkstation() != null ? jc.getWorkstation().getId() : null)
                                .workstationName(jc.getWorkstation() != null ? jc.getWorkstation().getWorkstationName()
                                                : null)
                                .toolDieNo(jc.getToolDieNo())
                                .operatorId(jc.getOperator() != null ? jc.getOperator().getId() : null)
                                .operatorName(jc.getOperator() != null ? jc.getOperator().getName() : null)
                                .shift(jc.getShift())
                                .plannedQty(jc.getPlannedQty())
                                .targetQty(jc.getTargetQty())
                                .producedQty(jc.getProducedQty())
                                .rejectedQty(jc.getRejectedQty())
                                .reworkQty(jc.getReworkQty())
                                .laborHours(jc.getLaborHours())
                                .workstationRunHours(jc.getWorkstationRunHours())
                                .breakdownTime(jc.getBreakdownTime())
                                .cycleTimeSec(jc.getCycleTimeSec())
                                .availabilityPct(jc.getAvailabilityPct())
                                .performancePct(jc.getPerformancePct())
                                .qualityPct(jc.getQualityPct())
                                .oeePct(jc.getOeePct())
                                .actualShoulderWidthMm(jc.getActualShoulderWidthMm())
                                .actualHookSizeMm(jc.getActualHookSizeMm())
                                .dimensionPass(jc.getDimensionPass())
                                .startTime(jc.getStartTime())
                                .endTime(jc.getEndTime())
                                .remarks(jc.getRemarks())
                                .createdAt(jc.getCreatedAt())
                                .build();
        }
}
