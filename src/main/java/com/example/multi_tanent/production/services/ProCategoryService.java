package com.example.multi_tanent.production.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProCategoryRequest;
import com.example.multi_tanent.production.dto.ProCategoryResponse;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.repository.ProCategoryRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class ProCategoryService {

    private final ProCategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public ProCategoryResponse create(ProCategoryRequest request) {
        Tenant tenant = getCurrentTenant();
        if (categoryRepository.existsByTenantIdAndNameIgnoreCase(tenant.getId(), request.getName())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists.");
        }
        if (categoryRepository.existsByTenantIdAndCodeIgnoreCase(tenant.getId(), request.getCode())) {
            throw new IllegalArgumentException("Category with code '" + request.getCode() + "' already exists.");
        }

        ProCategory category = new ProCategory();
        mapRequestToEntity(request, category, tenant);
        return ProCategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public List<ProCategoryResponse> getAll() {
        Long tenantId = getCurrentTenant().getId();
        return categoryRepository.findByTenantIdOrderByNameAsc(tenantId)
                .stream()
                .map(ProCategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProCategoryResponse update(Long id, ProCategoryRequest request) {
        Tenant tenant = getCurrentTenant();
        ProCategory category = categoryRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        mapRequestToEntity(request, category, tenant);
        return ProCategoryResponse.fromEntity(categoryRepository.save(category));
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProCategoryRequest request, ProCategory entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setName(request.getName());
        entity.setCode(request.getCode());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
            entity.setLocation(location);
        } else {
            entity.setLocation(null);
        }
    }
}