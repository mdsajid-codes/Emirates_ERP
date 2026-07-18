package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsClientTaskRepository extends JpaRepository<AtsClientTask, Long> {
    List<AtsClientTask> findByClientIdAndTenantId(Long clientId, Long tenantId);
    Optional<AtsClientTask> findByIdAndClientIdAndTenantId(Long id, Long clientId, Long tenantId);
    List<AtsClientTask> findByAssignedToIdAndTenantId(Long assignedToId, Long tenantId);
}
