package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.dto.*;
import com.example.multi_tanent.hanger.entity.*;
import com.example.multi_tanent.hanger.repository.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class HngCostRateService {

    private final HngCostRateRepository repo;
    private final TenantRepository tenantRepo;
    private final HngProductionBatchRepository batchRepo;
    private final HngBatchWireProcessingRepository wireRepo;
    private final HngJobCardRepository jobCardRepo;
    private final HngCoatingLogRepository coatingRepo;
    private final HngScrapEntryRepository scrapRepo;

    private Tenant currentTenant() {
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved"));
    }

    public HngCostRateResponse create(HngCostRateRequest req) {
        Tenant t = currentTenant();
        HngCostRate rate = HngCostRate.builder()
                .tenant(t)
                .rateKey(req.getRateKey())
                .rateLabel(req.getRateLabel())
                .rateValue(req.getRateValue())
                .unit(req.getUnit())
                .effectiveFrom(req.getEffectiveFrom())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();
        return toResponse(repo.save(rate));
    }

    public List<HngCostRateResponse> list() {
        Tenant t = currentTenant();
        return repo.findByTenantId(t.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public HngCostRateResponse update(Long id, HngCostRateRequest req) {
        Tenant t = currentTenant();
        HngCostRate rate = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Cost rate not found"));

        rate.setRateValue(req.getRateValue());
        rate.setIsActive(req.getIsActive());
        if (req.getEffectiveFrom() != null)
            rate.setEffectiveFrom(req.getEffectiveFrom());

        return toResponse(repo.save(rate));
    }

    public HngCostSheetResponse getCostSheet(Long batchId) {
        Tenant t = currentTenant();
        HngProductionBatch batch = batchRepo.findByIdAndTenantId(batchId, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));

        List<HngCostRate> rates = repo.findByTenantIdAndIsActiveTrue(t.getId());
        BigDecimal laborRate = getRate(rates, "LABOR_HOUR", new BigDecimal("200.0"));
        BigDecimal machineRate = getRate(rates, "MACHINE_HOUR", new BigDecimal("500.0"));
        BigDecimal overheadPct = getRate(rates, "OVERHEAD_PCT", new BigDecimal("15.0"));

        List<HngCostSheetResponse.CostLineItem> breakdown = new java.util.ArrayList<>();

        // 1. Raw Material Cost
        BigDecimal rmCost = BigDecimal.ZERO;
        if (batch.getCoilStock() != null) {
            BigDecimal ratePerKg = batch.getCoilStock().getRatePerKg() != null ? batch.getCoilStock().getRatePerKg()
                    : BigDecimal.ZERO;
            // Use totalWeightKg as a proxy for issued weight if not tracked per batch
            // elsewhere
            BigDecimal weight = batch.getCoilStock().getTotalWeightKg() != null
                    ? batch.getCoilStock().getTotalWeightKg()
                    : BigDecimal.ZERO;
            rmCost = ratePerKg.multiply(weight);
            breakdown.add(new HngCostSheetResponse.CostLineItem("Raw Material",
                    "Coil " + batch.getCoilStock().getCoilNo(), ratePerKg, weight, rmCost));
        }

        // 2. Wire Cutting Labor
        BigDecimal wireLaborCost = BigDecimal.ZERO;
        List<HngBatchWireProcessing> wireLogs = wireRepo.findByBatchIdAndTenantId(batchId, t.getId());
        for (HngBatchWireProcessing log : wireLogs) {
            if (log.getStartTime() != null && log.getEndTime() != null) {
                long minutes = java.time.Duration.between(log.getStartTime(), log.getEndTime()).toMinutes();
                BigDecimal hours = new BigDecimal(minutes).divide(new BigDecimal("60"), 2,
                        java.math.RoundingMode.HALF_UP);
                BigDecimal cost = hours.multiply(laborRate);
                wireLaborCost = wireLaborCost.add(cost);
                breakdown.add(new HngCostSheetResponse.CostLineItem("Wire Cutting", "Labor for " + hours + " hrs",
                        laborRate, hours, cost));
            }
        }

        // 3. Bending Labor & Machine
        BigDecimal bendingCost = BigDecimal.ZERO;
        List<HngJobCard> jobCards = jobCardRepo.findByBatchIdAndTenantId(batchId, t.getId());
        for (HngJobCard card : jobCards) {
            BigDecimal lHours = card.getLaborHours() != null ? card.getLaborHours() : BigDecimal.ZERO;
            BigDecimal mHours = card.getWorkstationRunHours() != null ? card.getWorkstationRunHours() : BigDecimal.ZERO;

            BigDecimal lCost = lHours.multiply(laborRate);
            BigDecimal mCost = mHours.multiply(machineRate);

            bendingCost = bendingCost.add(lCost).add(mCost);
            breakdown.add(new HngCostSheetResponse.CostLineItem("Bending", "Labor for " + lHours + " hrs", laborRate,
                    lHours, lCost));
            breakdown.add(new HngCostSheetResponse.CostLineItem("Bending", "Machine for " + mHours + " hrs",
                    machineRate, mHours, mCost));
        }

        // 4. Coating (Chemical + Labor)
        BigDecimal coatingCost = BigDecimal.ZERO;
        List<HngCoatingLog> coatingLogs = coatingRepo.findByBatchIdAndTenantId(batchId, t.getId());
        for (HngCoatingLog log : coatingLogs) {
            BigDecimal paintKg = log.getPaintConsumedKg() != null ? log.getPaintConsumedKg() : BigDecimal.ZERO;
            BigDecimal pRate = getRate(rates, "PAINT_PER_KG", new BigDecimal("350.0"));
            BigDecimal pCost = paintKg.multiply(pRate);

            BigDecimal cMinutes = log.getDurationMin() != null ? log.getDurationMin() : BigDecimal.ZERO;
            BigDecimal cHours = cMinutes.divide(new BigDecimal("60"), 2, java.math.RoundingMode.HALF_UP);
            BigDecimal cLaborCost = cHours.multiply(laborRate);

            coatingCost = coatingCost.add(pCost).add(cLaborCost);
            breakdown.add(new HngCostSheetResponse.CostLineItem("Coating", "Paint " + paintKg + " kg", pRate, paintKg,
                    pCost));
            breakdown.add(new HngCostSheetResponse.CostLineItem("Coating", "Labor for " + cHours + " hrs", laborRate,
                    cHours, cLaborCost));
        }

        // 5. Scrap Recovery (deducted)
        BigDecimal scrapRecovery = BigDecimal.ZERO;
        List<HngScrapEntry> scrapEntries = scrapRepo.findByBatchIdAndTenantId(batchId, t.getId());
        for (HngScrapEntry scrap : scrapEntries) {
            BigDecimal val = scrap.getScrapValue() != null ? scrap.getScrapValue() : BigDecimal.ZERO;
            scrapRecovery = scrapRecovery.add(val);
        }
        if (scrapRecovery.compareTo(BigDecimal.ZERO) > 0) {
            breakdown.add(new HngCostSheetResponse.CostLineItem("Recovery", "Scrap Value Recovery",
                    scrapRecovery.negate(), BigDecimal.ONE, scrapRecovery.negate()));
        }

        BigDecimal directCost = rmCost.add(wireLaborCost).add(bendingCost).add(coatingCost).subtract(scrapRecovery);
        BigDecimal overheadAmount = directCost.multiply(overheadPct).divide(new BigDecimal("100"), 2,
                java.math.RoundingMode.HALF_UP);
        breakdown.add(new HngCostSheetResponse.CostLineItem("Overhead", overheadPct + "% on direct cost", null, null,
                overheadAmount));

        BigDecimal totalCost = directCost.add(overheadAmount);

        return HngCostSheetResponse.builder()
                .batchId(batch.getId())
                .batchNo(batch.getBatchNo())
                .laborCost(wireLaborCost.add(bendingCost).add(coatingCost))
                .materialCost(rmCost)
                .electricityCost(BigDecimal.ZERO)
                .totalEstimatedCost(totalCost)
                .breakdown(breakdown)
                .build();
    }

    private BigDecimal getRate(List<HngCostRate> rates, String key, BigDecimal defaultValue) {
        return rates.stream()
                .filter(r -> r.getRateKey().equals(key))
                .map(HngCostRate::getRateValue)
                .findFirst()
                .orElse(defaultValue);
    }

    private HngCostRateResponse toResponse(HngCostRate r) {
        return HngCostRateResponse.builder()
                .id(r.getId())
                .rateKey(r.getRateKey())
                .rateLabel(r.getRateLabel())
                .rateValue(r.getRateValue())
                .unit(r.getUnit())
                .effectiveFrom(r.getEffectiveFrom())
                .isActive(r.getIsActive())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
