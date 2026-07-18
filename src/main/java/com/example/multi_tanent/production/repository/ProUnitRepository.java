package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProUnitRepository extends JpaRepository<ProUnit, Long> {
    List<ProUnit> findByTenantIdOrderByNameAsc(Long tenantId);
    Optional<ProUnit> findByTenantIdAndId(Long tenantId, Long id);
    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
}