package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareSubCategoryRequest;
import com.example.multi_tanent.warehouse.dto.WareSubCategoryResponse;
import com.example.multi_tanent.warehouse.entity.WareCategory;
import com.example.multi_tanent.warehouse.entity.WareSubCategory;
import com.example.multi_tanent.warehouse.repository.WareCategoryRepository;
import com.example.multi_tanent.warehouse.repository.WareSubCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class WareSubCategoryService {

    private final WareSubCategoryRepository subCategoryRepository;
    private final WareCategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found"));
    }

    public List<WareSubCategoryResponse> list(Long categoryId) {
        Tenant t = getCurrentTenant();
        List<WareSubCategory> list;
        if (categoryId != null) {
            list = subCategoryRepository.findByCategoryId(categoryId);
        } else {
            list = subCategoryRepository.findByEnterpriseId(t.getId());
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WareSubCategoryResponse create(WareSubCategoryRequest req) {
        Tenant t = getCurrentTenant();
        WareCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        WareSubCategory s = WareSubCategory.builder()
                .name(req.getName())
                .description(req.getDescription())
                .category(category)
                .enterprise(t)
                .build();
        return toResponse(subCategoryRepository.save(s));
    }

    public WareSubCategoryResponse update(Long id, WareSubCategoryRequest req) {
        WareSubCategory s = subCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SubCategory not found"));
        WareCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        s.setName(req.getName());
        s.setDescription(req.getDescription());
        s.setCategory(category);
        return toResponse(subCategoryRepository.save(s));
    }

    public void delete(Long id) {
        subCategoryRepository.deleteById(id);
    }

    private WareSubCategoryResponse toResponse(WareSubCategory s) {
        return WareSubCategoryResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .categoryId(s.getCategory().getId())
                .categoryName(s.getCategory().getName())
                .build();
    }
}
