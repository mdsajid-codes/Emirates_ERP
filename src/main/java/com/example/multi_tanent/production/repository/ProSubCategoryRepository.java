package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProSubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProSubCategoryRepository extends JpaRepository<ProSubCategory, Long> {
    List<ProSubCategory> findByTenantIdAndCategoryIdOrderByNameAsc(Long tenantId, Long categoryId);

    Optional<ProSubCategory> findByTenantIdAndId(Long tenantId, Long id);

    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);

    boolean existsByCategoryIdAndCodeIgnoreCase(Long categoryId, String code);
}