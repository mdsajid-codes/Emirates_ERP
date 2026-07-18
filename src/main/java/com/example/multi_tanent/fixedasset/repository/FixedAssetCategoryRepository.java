package com.example.multi_tanent.fixedasset.repository;

import com.example.multi_tanent.fixedasset.entity.FixedAssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FixedAssetCategoryRepository extends JpaRepository<FixedAssetCategory, Long> {
    List<FixedAssetCategory> findByTenant_Id(Long tenantId);
}
