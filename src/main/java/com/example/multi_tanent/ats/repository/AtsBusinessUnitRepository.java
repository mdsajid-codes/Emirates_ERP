package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsBusinessUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsBusinessUnitRepository extends JpaRepository<AtsBusinessUnit, Long> {
    List<AtsBusinessUnit> findByTenantId(Long tenantId);
    List<AtsBusinessUnit> findByTenantIdAndIsActiveTrue(Long tenantId);
    Page<AtsBusinessUnit> findByTenantId(Long tenantId, Pageable pageable);
    Optional<AtsBusinessUnit> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
    boolean existsByCodeAndTenantId(String code, Long tenantId);
}
