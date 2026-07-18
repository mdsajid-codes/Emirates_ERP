package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HangerTypeRequest;
import com.example.multi_tanent.hanger.dto.HangerTypeResponse;
import com.example.multi_tanent.hanger.entity.HangerType;
import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import com.example.multi_tanent.hanger.repository.HangerTypeRepository;
import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.production.repository.ProFinishedGoodRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HangerTypeService {

    private final HangerTypeRepository hangerTypeRepository;
    private final TenantRepository tenantRepository;
    private final ProFinishedGoodRepository finishedGoodRepository;

    /** List all active hanger types for the current tenant */
    public List<HangerTypeResponse> getAllActive() {
        String tenantId = TenantContext.getTenantId();
        return hangerTypeRepository.findByTenantTenantIdAndIsActiveTrue(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Get a single hanger type by ID */
    public HangerTypeResponse getById(Long id) {
        return toResponse(findById(id));
    }

    /** Get a hanger type by its type name (e.g., ADULT) */
    public HangerTypeResponse getByTypeName(HangerTypeEnum typeName) {
        String tenantId = TenantContext.getTenantId();
        HangerType entity = hangerTypeRepository
                .findByTenantTenantIdAndTypeName(tenantId, typeName)
                .orElseThrow(() -> new EntityNotFoundException(
                        "HangerType not found for type: " + typeName));
        return toResponse(entity);
    }

    /** Create a new hanger type — only one per typeName per tenant */
    @Transactional
    public HangerTypeResponse create(HangerTypeRequest request) {
        String tenantId = TenantContext.getTenantId();

        if (hangerTypeRepository.existsByTenantTenantIdAndTypeName(tenantId, request.getTypeName())) {
            throw new IllegalArgumentException(
                    "HangerType already exists for: " + request.getTypeName() +
                            ". Use update to modify it.");
        }

        Tenant tenant = tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));

        HangerType entity = HangerType.builder()
                .tenant(tenant)
                .typeName(request.getTypeName())
                .unitWeightGrams(request.getUnitWeightGrams())
                .standardWidthCm(request.getStandardWidthCm())
                .standardHookCm(request.getStandardHookCm())
                .toleranceMm(request.getToleranceMm())
                .maxDefectPct(request.getMaxDefectPct())
                .minQcSampleSize(request.getMinQcSampleSize())
                .defaultBundleSize(request.getDefaultBundleSize())
                .minLoadTestKg(request.getMinLoadTestKg())
                .standardWireGaugeMm(request.getStandardWireGaugeMm())
                .description(request.getDescription())
                .finishedGood(request.getFinishedGoodId() != null
                        ? finishedGoodRepository.findById(request.getFinishedGoodId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                        "Finished Good not found: " + request.getFinishedGoodId()))
                        : null)
                .build();

        return toResponse(hangerTypeRepository.save(entity));
    }

    /** Update an existing hanger type */
    @Transactional
    public HangerTypeResponse update(Long id, HangerTypeRequest request) {
        HangerType entity = findById(id);

        entity.setUnitWeightGrams(request.getUnitWeightGrams());
        entity.setStandardWidthCm(request.getStandardWidthCm());
        entity.setStandardHookCm(request.getStandardHookCm());
        if (request.getToleranceMm() != null)
            entity.setToleranceMm(request.getToleranceMm());
        if (request.getMaxDefectPct() != null)
            entity.setMaxDefectPct(request.getMaxDefectPct());
        if (request.getMinQcSampleSize() != null)
            entity.setMinQcSampleSize(request.getMinQcSampleSize());
        if (request.getDefaultBundleSize() != null)
            entity.setDefaultBundleSize(request.getDefaultBundleSize());
        if (request.getMinLoadTestKg() != null)
            entity.setMinLoadTestKg(request.getMinLoadTestKg());
        if (request.getStandardWireGaugeMm() != null)
            entity.setStandardWireGaugeMm(request.getStandardWireGaugeMm());
        if (request.getDescription() != null)
            entity.setDescription(request.getDescription());
        if (request.getFinishedGoodId() != null) {
            entity.setFinishedGood(finishedGoodRepository.findById(request.getFinishedGoodId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Finished Good not found: " + request.getFinishedGoodId())));
        } else {
            entity.setFinishedGood(null);
        }

        return toResponse(hangerTypeRepository.save(entity));
    }

    /** Soft-delete (deactivate) a hanger type */
    @Transactional
    public void deactivate(Long id) {
        HangerType entity = findById(id);
        entity.setIsActive(false);
        hangerTypeRepository.save(entity);
    }

    // ---- helpers ----

    private HangerType findById(Long id) {
        return hangerTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("HangerType not found: " + id));
    }

    private HangerTypeResponse toResponse(HangerType e) {
        HangerTypeResponse r = new HangerTypeResponse();
        r.setId(e.getId());
        r.setTypeName(e.getTypeName());
        r.setUnitWeightGrams(e.getUnitWeightGrams());
        r.setStandardWidthCm(e.getStandardWidthCm());
        r.setStandardHookCm(e.getStandardHookCm());
        r.setToleranceMm(e.getToleranceMm());
        r.setMaxDefectPct(e.getMaxDefectPct());
        r.setMinQcSampleSize(e.getMinQcSampleSize());
        r.setDefaultBundleSize(e.getDefaultBundleSize());
        r.setMinLoadTestKg(e.getMinLoadTestKg());
        r.setStandardWireGaugeMm(e.getStandardWireGaugeMm());
        r.setIsActive(e.getIsActive());
        r.setDescription(e.getDescription());
        if (e.getFinishedGood() != null) {
            r.setFinishedGoodId(e.getFinishedGood().getId());
            r.setFinishedGoodName(e.getFinishedGood().getName());
            r.setFinishedGoodCode(e.getFinishedGood().getItemCode());
        }
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());
        return r;
    }
}
