package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmCompany;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrmCompanyRepository extends JpaRepository<CrmCompany, Long> {
    List<CrmCompany> findByTenantId(Long tenantId);
    Optional<CrmCompany> findByIdAndTenantId(Long id, Long tenantId);
    Optional<CrmCompany> findByNameAndTenantId(String name, Long tenantId);
    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
    long countByTenantId(Long tenantId);
}