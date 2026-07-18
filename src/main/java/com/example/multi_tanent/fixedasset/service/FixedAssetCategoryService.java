package com.example.multi_tanent.fixedasset.service;

import com.example.multi_tanent.accounts.exception.ResourceNotFoundException;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fixedasset.entity.FixedAssetCategory;
import com.example.multi_tanent.fixedasset.repository.FixedAssetCategoryRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class FixedAssetCategoryService {

    private final FixedAssetCategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tid = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tid)
                .or(() -> tenantRepository.findFirstByOrderByIdAsc())
                .orElseThrow(() -> new ResourceNotFoundException("No tenant record found in database."));
    }

    public List<FixedAssetCategory> getAllCategories() {
        Long tenantId = getCurrentTenant().getId();
        return categoryRepository.findByTenant_Id(tenantId);
    }

    public FixedAssetCategory createCategory(FixedAssetCategory category) {
        category.setTenant(getCurrentTenant());
        return categoryRepository.save(category);
    }

    public FixedAssetCategory updateCategory(Long id, FixedAssetCategory details) {
        FixedAssetCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(details.getName());
        category.setDescription(details.getDescription());
        category.setUsefulLifeDefault(details.getUsefulLifeDefault());
        category.setDepreciationMethodDefault(details.getDepreciationMethodDefault());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
