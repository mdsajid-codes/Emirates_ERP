package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmUserRoleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmUserRoleAssignmentRepository extends JpaRepository<CrmUserRoleAssignment, Long> {
    Optional<CrmUserRoleAssignment> findByTenant_IdAndEmployeeId(Long tenantId, Long employeeId);
    List<CrmUserRoleAssignment> findByRole_Id(Long roleId);
    void deleteByTenant_IdAndEmployeeId(Long tenantId, Long employeeId);
}
