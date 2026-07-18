package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProTaxRepository extends JpaRepository<ProTax, Long> {
    List<ProTax> findByTenantIdOrderByCodeAsc(Long tenantId);
    Optional<ProTax> findByTenantIdAndId(Long tenantId, Long id);
    boolean existsByTenantIdAndCodeIgnoreCase(Long tenantId, String code);
}