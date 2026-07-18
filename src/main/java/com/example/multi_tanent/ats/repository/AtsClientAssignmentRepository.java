package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsClientAssignmentRepository extends JpaRepository<AtsClientAssignment, Long> {
    Optional<AtsClientAssignment> findByClientIdAndTenantId(Long clientId, Long tenantId);
}
