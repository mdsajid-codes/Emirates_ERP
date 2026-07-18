package com.example.multi_tanent.production.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProSubCategoryRequest;
import com.example.multi_tanent.production.dto.ProSubCategoryResponse;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProSubCategory;
import com.example.multi_tanent.production.repository.ProCategoryRepository;
import com.example.multi_tanent.production.repository.ProSubCategoryRepository;
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
public class ProSubCategoryService {

    private final ProSubCategoryRepository subCategoryRepository;
    private final ProCategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public ProSubCategoryResponse create(ProSubCategoryRequest request) {
        Tenant tenant = getCurrentTenant();
        ProCategory parentCategory = categoryRepository.findByTenantIdAndId(tenant.getId(), request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Parent category not found with id: " + request.getCategoryId()));

        if (subCategoryRepository.existsByCategoryIdAndNameIgnoreCase(parentCategory.getId(), request.getName())) {
            throw new IllegalArgumentException("Sub-category with name '" + request.getName() + "' already exists in this category.");
        }
        if (subCategoryRepository.existsByCategoryIdAndCodeIgnoreCase(parentCategory.getId(), request.getCode())) {
            throw new IllegalArgumentException("Sub-category with code '" + request.getCode() + "' already exists in this category.");
        }

        ProSubCategory subCategory = new ProSubCategory();
        mapRequestToEntity(request, subCategory, tenant, parentCategory);
        return ProSubCategoryResponse.fromEntity(subCategoryRepository.save(subCategory));
    }

    @Transactional(readOnly = true)
    public List<ProSubCategoryResponse> getAllByCategoryId(Long categoryId) {
        Long tenantId = getCurrentTenant().getId();
        return subCategoryRepository.findByTenantIdAndCategoryIdOrderByNameAsc(tenantId, categoryId)
                .stream()
                .map(ProSubCategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProSubCategoryResponse update(Long id, ProSubCategoryRequest request) {
        Tenant tenant = getCurrentTenant();
        ProSubCategory subCategory = subCategoryRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Sub-category not found with id: " + id));

        ProCategory parentCategory = categoryRepository.findByTenantIdAndId(tenant.getId(), request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Parent category not found with id: " + request.getCategoryId()));

        mapRequestToEntity(request, subCategory, tenant, parentCategory);
        return ProSubCategoryResponse.fromEntity(subCategoryRepository.save(subCategory));
    }

    public void delete(Long id) {
        if (!subCategoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Sub-category not found with id: " + id);
        }
        subCategoryRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProSubCategoryRequest request, ProSubCategory entity, Tenant tenant, ProCategory parentCategory) {
        entity.setTenant(tenant);
        entity.setCategory(parentCategory);
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