package com.example.multi_tanent.tenant.base.service;

import com.example.multi_tanent.tenant.base.dto.BaseCategoryRequest;
import com.example.multi_tanent.tenant.base.entity.BaseCategory;
import com.example.multi_tanent.tenant.base.repository.BaseCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class BaseCategoryService {

    private final BaseCategoryRepository categoryRepository;

    public BaseCategoryService(BaseCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public BaseCategory createCategory(BaseCategoryRequest request) {
        BaseCategory category = new BaseCategory();
        category.setName(request.getName());
        category.setCode(request.getCode());
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<BaseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<BaseCategory> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public BaseCategory updateCategory(Long id, BaseCategoryRequest request) {
        BaseCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        category.setName(request.getName());
        category.setCode(request.getCode());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}