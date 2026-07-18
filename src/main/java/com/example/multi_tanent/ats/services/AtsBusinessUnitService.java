package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsBusinessUnitRequest;
import com.example.multi_tanent.ats.dto.AtsBusinessUnitResponse;
import com.example.multi_tanent.ats.entity.AtsBusinessUnit;
import com.example.multi_tanent.ats.repository.AtsBusinessUnitRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsBusinessUnitService {

    private final AtsBusinessUnitRepository businessUnitRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsBusinessUnitResponse create(AtsBusinessUnitRequest request) {
        Tenant tenant = currentTenant();

        if (businessUnitRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Business Unit with name '" + request.getName() + "' already exists for this tenant.");
        }

        if (request.getCode() != null && !request.getCode().trim().isEmpty()
                && businessUnitRepository.existsByCodeAndTenantId(request.getCode(), tenant.getId())) {
            throw new IllegalArgumentException("Business Unit with code '" + request.getCode() + "' already exists for this tenant.");
        }

        AtsBusinessUnit businessUnit = AtsBusinessUnit.builder()
                .tenant(tenant)
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        AtsBusinessUnit saved = businessUnitRepository.save(businessUnit);
        return toResponse(saved);
    }

    public AtsBusinessUnitResponse update(Long id, AtsBusinessUnitRequest request) {
        Tenant tenant = currentTenant();
        AtsBusinessUnit businessUnit = businessUnitRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id " + id));

        if (!businessUnit.getName().equalsIgnoreCase(request.getName())
                && businessUnitRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Business Unit with name '" + request.getName() + "' already exists for this tenant.");
        }

        if (request.getCode() != null && !request.getCode().trim().isEmpty()
                && !request.getCode().equalsIgnoreCase(businessUnit.getCode())
                && businessUnitRepository.existsByCodeAndTenantId(request.getCode(), tenant.getId())) {
            throw new IllegalArgumentException("Business Unit with code '" + request.getCode() + "' already exists for this tenant.");
        }

        businessUnit.setName(request.getName());
        businessUnit.setCode(request.getCode());
        businessUnit.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            businessUnit.setIsActive(request.getIsActive());
        }

        AtsBusinessUnit updated = businessUnitRepository.save(businessUnit);
        return toResponse(updated);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsBusinessUnitResponse> getPage(Pageable pageable) {
        Tenant tenant = currentTenant();
        return businessUnitRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsBusinessUnitResponse> getAll() {
        Tenant tenant = currentTenant();
        return businessUnitRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsBusinessUnitResponse> getAllActive() {
        Tenant tenant = currentTenant();
        return businessUnitRepository.findByTenantIdAndIsActiveTrue(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsBusinessUnitResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsBusinessUnit businessUnit = businessUnitRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id " + id));
        return toResponse(businessUnit);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsBusinessUnit businessUnit = businessUnitRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id " + id));
        businessUnitRepository.delete(businessUnit);
    }

    public AtsBusinessUnitResponse toggleActive(Long id) {
        Tenant tenant = currentTenant();
        AtsBusinessUnit businessUnit = businessUnitRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id " + id));
        businessUnit.setIsActive(!businessUnit.getIsActive());
        AtsBusinessUnit updated = businessUnitRepository.save(businessUnit);
        return toResponse(updated);
    }

    private AtsBusinessUnitResponse toResponse(AtsBusinessUnit businessUnit) {
        return AtsBusinessUnitResponse.builder()
                .id(businessUnit.getId())
                .name(businessUnit.getName())
                .code(businessUnit.getCode())
                .description(businessUnit.getDescription())
                .isActive(businessUnit.getIsActive())
                .createdAt(businessUnit.getCreatedAt())
                .updatedAt(businessUnit.getUpdatedAt())
                .build();
    }
}
