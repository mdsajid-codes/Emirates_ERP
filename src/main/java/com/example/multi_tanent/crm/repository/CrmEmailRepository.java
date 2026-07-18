package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmEmail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrmEmailRepository extends JpaRepository<CrmEmail, Long> {
    Page<CrmEmail> findByTenantId(Long tenantId, Pageable pageable);
    List<CrmEmail> findByLeadIdAndTenantId(Long leadId, Long tenantId);
    long countByTenantIdAndSentById(Long tenantId, Long sentById);
}