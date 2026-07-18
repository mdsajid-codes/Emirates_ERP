package com.example.multi_tanent.crm.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmRole;

import java.util.List;
import java.util.Optional;

public interface CrmRoleRepository extends JpaRepository<CrmRole, Long> {
    List<CrmRole> findByTenantIdOrderByNameAsc(Long tenantId);
    Optional<CrmRole> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
    Optional<CrmRole> findByTenantIdAndNameIgnoreCase(Long tenantId, String name);
}

