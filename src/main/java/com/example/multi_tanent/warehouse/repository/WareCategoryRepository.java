package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WareCategoryRepository extends JpaRepository<WareCategory, Long> {
    List<WareCategory> findByEnterpriseId(Long tenantId);
}
