package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProCategoryRepository extends JpaRepository<ProCategory, Long> {
    List<ProCategory> findByTenantIdOrderByNameAsc(Long tenantId);

    Optional<ProCategory> findByTenantIdAndId(Long tenantId, Long id);

    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);

    boolean existsByTenantIdAndCodeIgnoreCase(Long tenantId, String code);
}