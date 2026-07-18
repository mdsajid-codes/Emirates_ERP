package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngScrapEntryRequest;
import com.example.multi_tanent.hanger.dto.HngScrapEntryResponse;
import com.example.multi_tanent.hanger.dto.HngScrapSummaryResponse;
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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HngScrapEntryService {

    private final HngScrapEntryRepository repo;
    private final HngProductionBatchRepository batchRepo;
    private final HngBatchWireProcessingRepository wireRepo;
    private final HngCoatingLogRepository coatingRepo;
    private final HngQcLogRepository qcRepo;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(key)
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    @Transactional
    public HngScrapEntryResponse create(HngScrapEntryRequest req) {
        Tenant t = currentTenant();
        HngProductionBatch batch = batchRepo.findByIdAndTenantId(req.getBatchId(), t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found: " + req.getBatchId()));

        HngScrapEntry.HngScrapEntryBuilder builder = HngScrapEntry.builder()
                .tenant(t)
                .batch(batch)
                .stage(req.getStage())
                .scrapType(req.getScrapType())
                .scrapWeightKg(req.getScrapWeightKg())
                .ratePerKg(req.getRatePerKg() != null ? req.getRatePerKg() : BigDecimal.ZERO)
                .remarks(req.getRemarks());

        if (req.getWireProcessingId() != null) {
            builder.wireProcessing(wireRepo.findById(req.getWireProcessingId()).orElse(null));
        }
        if (req.getCoatingLogId() != null) {
            builder.coatingLog(coatingRepo.findById(req.getCoatingLogId()).orElse(null));
        }
        if (req.getQcLogId() != null) {
            builder.qcLog(qcRepo.findById(req.getQcLogId()).orElse(null));
        }

        BigDecimal value = req.getScrapWeightKg()
                .multiply(req.getRatePerKg() != null ? req.getRatePerKg() : BigDecimal.ZERO);
        builder.scrapValue(value);

        HngScrapEntry saved = repo.save(builder.build());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<HngScrapEntryResponse> getByBatch(Long batchId) {
        Tenant t = currentTenant();
        return repo.findByBatchIdAndTenantId(batchId, t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HngScrapSummaryResponse getSummaryByBatch(Long batchId) {
        Tenant t = currentTenant();
        List<HngScrapEntry> entries = repo.findByBatchIdAndTenantId(batchId, t.getId());

        BigDecimal totalWeight = entries.stream()
                .map(e -> e.getScrapWeightKg() != null ? e.getScrapWeightKg() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalValue = entries.stream()
                .map(e -> e.getScrapValue() != null ? e.getScrapValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> weightByStage = entries.stream()
                .filter(e -> e.getStage() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getStage().name(),
                        Collectors.reducing(BigDecimal.ZERO,
                                e -> e.getScrapWeightKg() != null ? e.getScrapWeightKg() : BigDecimal.ZERO,
                                BigDecimal::add)));

        return HngScrapSummaryResponse.builder()
                .totalScrapWeightKg(totalWeight)
                .totalScrapValue(totalValue)
                .totalEntries(entries.size())
                .weightByStage(weightByStage)
                .build();
    }

    private HngScrapEntryResponse toResponse(HngScrapEntry s) {
        return HngScrapEntryResponse.builder()
                .id(s.getId())
                .batchId(s.getBatch().getId())
                .batchNo(s.getBatch().getBatchNo())
                .wireProcessingId(s.getWireProcessing() != null ? s.getWireProcessing().getId() : null)
                .stage(s.getStage())
                .scrapType(s.getScrapType())
                .scrapWeightKg(s.getScrapWeightKg())
                .ratePerKg(s.getRatePerKg())
                .scrapValue(s.getScrapValue())
                .remarks(s.getRemarks())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
