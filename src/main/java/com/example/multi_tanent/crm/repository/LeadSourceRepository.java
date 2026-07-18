package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.LeadSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadSourceRepository extends JpaRepository<LeadSource, Long> {
    List<LeadSource> findByTenantIdOrderByNameAsc(Long tenantId);
    Optional<LeadSource> findByTenantIdAndId(Long tenantId, Long id);
    Optional<LeadSource> findByNameAndTenantId(String name, Long tenantId);
    boolean existsByTenantIdAndId(Long tenantId, Long id);
}