package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareCategoryRequest;
import com.example.multi_tanent.warehouse.dto.WareCategoryResponse;
import com.example.multi_tanent.warehouse.dto.WareSubCategoryResponse;
import com.example.multi_tanent.warehouse.entity.WareCategory;
import com.example.multi_tanent.warehouse.repository.WareCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class WareCategoryService {

    private final WareCategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found"));
    }

    @Transactional(readOnly = true)
    public WareCategoryResponse getById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
    }

    public List<WareCategoryResponse> list() {
        Tenant t = getCurrentTenant();
        return categoryRepository.findByEnterpriseId(t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WareCategoryResponse create(WareCategoryRequest req) {
        Tenant t = getCurrentTenant();
        WareCategory c = WareCategory.builder()
                .name(req.getName())
                .description(req.getDescription())
                .enterprise(t)
                .build();
        return toResponse(categoryRepository.save(c));
    }

    public WareCategoryResponse update(Long id, WareCategoryRequest req) {
        WareCategory c = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        return toResponse(categoryRepository.save(c));
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private WareCategoryResponse toResponse(WareCategory c) {
        return WareCategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .subCategories(c.getSubCategories().stream()
                        .map(s -> WareSubCategoryResponse.builder()
                                .id(s.getId())
                                .name(s.getName())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
