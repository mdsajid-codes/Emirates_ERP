package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsActionRequest;
import com.example.multi_tanent.ats.dto.AtsActionResponse;
import com.example.multi_tanent.ats.entity.AtsAction;
import com.example.multi_tanent.ats.repository.AtsActionRepository;
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
public class AtsActionService {

    private final AtsActionRepository actionRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsActionResponse create(AtsActionRequest request) {
        Tenant tenant = currentTenant();

        if (actionRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Action with name '" + request.getName() + "' already exists for this tenant.");
        }

        AtsAction action = AtsAction.builder()
                .tenant(tenant)
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        AtsAction saved = actionRepository.save(action);
        return toResponse(saved);
    }

    public AtsActionResponse update(Long id, AtsActionRequest request) {
        Tenant tenant = currentTenant();
        AtsAction action = actionRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Action not found with id " + id));

        if (!action.getName().equalsIgnoreCase(request.getName())
                && actionRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Action with name '" + request.getName() + "' already exists for this tenant.");
        }

        action.setName(request.getName());
        action.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            action.setIsActive(request.getIsActive());
        }

        AtsAction updated = actionRepository.save(action);
        return toResponse(updated);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsActionResponse> getPage(Pageable pageable) {
        Tenant tenant = currentTenant();
        return actionRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsActionResponse> getAll() {
        Tenant tenant = currentTenant();
        return actionRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsActionResponse> getAllActive() {
        Tenant tenant = currentTenant();
        return actionRepository.findByTenantIdAndIsActiveTrue(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsActionResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsAction action = actionRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Action not found with id " + id));
        return toResponse(action);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsAction action = actionRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Action not found with id " + id));
        actionRepository.delete(action);
    }

    public AtsActionResponse toggleActive(Long id) {
        Tenant tenant = currentTenant();
        AtsAction action = actionRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Action not found with id " + id));
        action.setIsActive(!action.getIsActive());
        AtsAction updated = actionRepository.save(action);
        return toResponse(updated);
    }

    private AtsActionResponse toResponse(AtsAction action) {
        return AtsActionResponse.builder()
                .id(action.getId())
                .name(action.getName())
                .description(action.getDescription())
                .isActive(action.getIsActive())
                .createdAt(action.getCreatedAt())
                .updatedAt(action.getUpdatedAt())
                .build();
    }
}
