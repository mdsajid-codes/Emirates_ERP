package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsDegreeRequest;
import com.example.multi_tanent.ats.dto.AtsDegreeResponse;
import com.example.multi_tanent.ats.entity.AtsDegree;
import com.example.multi_tanent.ats.repository.AtsDegreeRepository;
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
public class AtsDegreeService {

    private final AtsDegreeRepository degreeRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsDegreeResponse create(AtsDegreeRequest request) {
        Tenant tenant = currentTenant();

        if (degreeRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Degree with name '" + request.getName() + "' already exists for this tenant.");
        }

        AtsDegree degree = AtsDegree.builder()
                .tenant(tenant)
                .name(request.getName())
                .build();

        AtsDegree saved = degreeRepository.save(degree);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsDegreeResponse> getAll(Pageable pageable) {
        Tenant tenant = currentTenant();
        return degreeRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsDegreeResponse> listAll() {
        Tenant tenant = currentTenant();
        return degreeRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsDegreeResponse getById(Long id) {
        Tenant tenant = currentTenant();
        return degreeRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Degree not found with id: " + id));
    }

    public AtsDegreeResponse update(Long id, AtsDegreeRequest request) {
        Tenant tenant = currentTenant();
        AtsDegree degree = degreeRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Degree not found with id: " + id));

        if (!degree.getName().equalsIgnoreCase(request.getName())
                && degreeRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Degree with name '" + request.getName() + "' already exists for this tenant.");
        }

        degree.setName(request.getName());

        AtsDegree updated = degreeRepository.save(degree);
        return toResponse(updated);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsDegree degree = degreeRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Degree not found with id: " + id));
        degreeRepository.delete(degree);
    }

    private AtsDegreeResponse toResponse(AtsDegree degree) {
        return AtsDegreeResponse.builder()
                .id(degree.getId())
                .name(degree.getName())
                .build();
    }
}
