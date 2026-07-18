package com.example.multi_tanent.crm.repository;


import com.example.multi_tanent.crm.entity.CrmTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrmTaskRepository extends JpaRepository<CrmTask, Long> {
    List<CrmTask> findByTenantIdOrderByDueDateAscIdAsc(Long tenantId);
    List<CrmTask> findByTenantIdAndAssignedToIdOrderByDueDateAscIdAsc(Long tenantId, Long assignedToId);
    Optional<CrmTask> findByIdAndTenantId(Long id, Long tenantId);
    List<CrmTask> findByTenantIdAndLeadIdOrderByDueDateAscIdAsc(Long tenantId, Long leadId);
    long countByTenantIdAndStatusNot(Long tenantId, String status);
    long countByTenantIdAndAssignedToId(Long tenantId, Long assignedToId);
    List<CrmTask> findTop5ByTenantIdOrderByCreatedAtDesc(Long tenantId);
}
