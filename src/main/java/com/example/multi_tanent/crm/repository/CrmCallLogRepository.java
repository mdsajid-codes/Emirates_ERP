package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmCallLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrmCallLogRepository extends JpaRepository<CrmCallLog, Long> {
    Page<CrmCallLog> findByTenantId(Long tenantId, Pageable pageable);
    Page<CrmCallLog> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId, Pageable pageable);
    Optional<CrmCallLog> findByIdAndTenantId(Long id, Long tenantId);
    List<CrmCallLog> findByLeadIdAndTenantId(Long leadId, Long tenantId);
}