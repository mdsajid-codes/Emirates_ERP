package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngCoilStockResponse;
import com.example.multi_tanent.hanger.entity.HngCoilStock;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.repository.HngCoilStockRepository;
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
public class HngCoilStockService {

    private final HngCoilStockRepository coilStockRepository;

    /**
     * List all coils for the current tenant (Phase 2 will auto-create these from
     * GRN approval)
     */
    public List<HngCoilStockResponse> getAll() {
        return coilStockRepository
                .findByTenantTenantIdOrderByCreatedAtDesc(TenantContext.getTenantId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Get all coils by inspection status (e.g., PENDING for QC dashboard) */
    public List<HngCoilStockResponse> getByInspectionStatus(CoilInspectionStatus status) {
        return coilStockRepository
                .findByTenantTenantIdAndInspectionStatus(TenantContext.getTenantId(), status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Get all AVAILABLE/PARTIAL coils — stock available for production */
    public List<HngCoilStockResponse> getAvailableStock() {
        String tenantId = TenantContext.getTenantId();
        List<HngCoilStock> available = coilStockRepository.findByTenantTenantIdAndStatus(tenantId,
                CoilStatus.AVAILABLE);
        List<HngCoilStock> partial = coilStockRepository.findByTenantTenantIdAndStatus(tenantId, CoilStatus.PARTIAL);
        available.addAll(partial);
        return available.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Get single coil by ID */
    public HngCoilStockResponse getById(Long id) {
        return toResponse(findById(id));
    }

    /**
     * Get eligible coils for material issue — filters by gauge and available weight
     */
    public List<HngCoilStockResponse> getEligibleForIssue(BigDecimal wireGaugeMm, BigDecimal minWeightRequired) {
        return coilStockRepository
                .findEligibleCoilsForIssue(TenantContext.getTenantId(), wireGaugeMm, minWeightRequired)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Total remaining wire weight in stock */
    public BigDecimal getTotalRemainingWeight() {
        return coilStockRepository.sumRemainingWeightByTenantId(TenantContext.getTenantId());
    }

    /** GET all coils that have been issued to a specific Manufacturing Order */
    public List<HngCoilStockResponse> getByMo(Long moId) {
        return coilStockRepository
                .findCoilsIssuedToMo(moId, TenantContext.getTenantId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update QC inspection status (QC team approves/rejects a coil).
     * If REJECTED, coil moves to QUARANTINE status — cannot be issued.
     */
    @Transactional
    public HngCoilStockResponse updateInspectionStatus(Long id, CoilInspectionStatus inspectionStatus, String remarks) {
        HngCoilStock coil = findById(id);
        coil.setInspectionStatus(inspectionStatus);
        coil.setQcRemarks(remarks);
        if (inspectionStatus == CoilInspectionStatus.REJECTED) {
            coil.setStatus(CoilStatus.QUARANTINE);
        }
        return toResponse(coilStockRepository.save(coil));
    }

    // ---- helpers ----

    private HngCoilStock findById(Long id) {
        return coilStockRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coil stock not found: " + id));
    }

    HngCoilStockResponse toResponse(HngCoilStock e) {
        HngCoilStockResponse r = new HngCoilStockResponse();
        r.setId(e.getId());
        r.setCoilNo(e.getCoilNo());
        r.setGrnItemId(e.getGrnItemId());
        r.setLotNo(e.getLotNo());
        r.setHeatNo(e.getHeatNo());
        r.setSupplierName(e.getSupplierName());
        r.setMaterialType(e.getMaterialType());
        r.setWireGaugeMm(e.getWireGaugeMm());
        r.setTotalWeightKg(e.getTotalWeightKg());
        r.setRemainingWeightKg(e.getRemainingWeightKg());
        r.setRatePerKg(e.getRatePerKg());
        r.setWarehouseLocation(e.getWarehouseLocation());
        r.setInspectionStatus(e.getInspectionStatus());
        r.setStatus(e.getStatus());
        r.setBarcodeQr(e.getBarcodeQr());
        r.setMillCertificateUrl(e.getMillCertificateUrl());
        r.setReceivedDate(e.getReceivedDate());
        r.setQcRemarks(e.getQcRemarks());
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());

        // Derived fields
        if (e.getTotalWeightKg() != null && e.getRemainingWeightKg() != null) {
            r.setUsedWeightKg(e.getTotalWeightKg().subtract(e.getRemainingWeightKg()));
            if (e.getTotalWeightKg().compareTo(BigDecimal.ZERO) > 0) {
                r.setRemainingPct(e.getRemainingWeightKg()
                        .divide(e.getTotalWeightKg(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")));
            }
        }
        if (e.getRemainingWeightKg() != null && e.getRatePerKg() != null) {
            r.setEstimatedCoilValue(e.getRemainingWeightKg().multiply(e.getRatePerKg()));
        }

        return r;
    }
}
