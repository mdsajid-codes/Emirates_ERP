package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmAuditLogRepository extends JpaRepository<CrmAuditLog, Long>, JpaSpecificationExecutor<CrmAuditLog> {

    Page<CrmAuditLog> findByTenantId(Long tenantId, Pageable pageable);

    Page<CrmAuditLog> findByTenantIdAndEntityType(Long tenantId, String entityType, Pageable pageable);

    Page<CrmAuditLog> findByTenantIdAndActionContainingIgnoreCase(Long tenantId, String action, Pageable pageable);
}
