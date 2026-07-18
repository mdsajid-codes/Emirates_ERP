package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareSubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WareSubCategoryRepository extends JpaRepository<WareSubCategory, Long> {
    List<WareSubCategory> findByCategoryId(Long categoryId);

    List<WareSubCategory> findByEnterpriseId(Long tenantId);
}
