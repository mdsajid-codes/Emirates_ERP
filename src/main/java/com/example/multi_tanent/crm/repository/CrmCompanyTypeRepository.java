package com.example.multi_tanent.crm.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CompanyType;



public interface CrmCompanyTypeRepository extends JpaRepository<CompanyType, Long> {

    List<CompanyType> findByTenantIdOrderByNameAsc(Long tenantId);

    Optional<CompanyType> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
}

