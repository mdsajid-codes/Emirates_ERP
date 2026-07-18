package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.CategoryRequest;
import com.example.multi_tanent.pos.entity.Category;
import com.example.multi_tanent.pos.repository.CategoryRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    public CategoryService(CategoryRepository categoryRepository, TenantRepository tenantRepository) {
        this.categoryRepository = categoryRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public Category createCategory(CategoryRequest request) {
        Tenant currentTenant = getCurrentTenant();
        Category category = new Category();
        category.setTenant(currentTenant);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setCreatedAt(OffsetDateTime.now());
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategoriesForCurrentTenant() {
        return categoryRepository.findByTenantId(getCurrentTenant().getId());
    }

    @Transactional(readOnly = true)
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findByIdAndTenantId(id, getCurrentTenant().getId());
    }

    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = getCategoryById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        // Add logic here to check if category is in use before deleting
        categoryRepository.delete(category);
    }
}