package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.EmployeeGLAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeGLAccountRepository extends JpaRepository<EmployeeGLAccount, Long> {

    @Query("SELECT e FROM EmployeeGLAccount e WHERE e.tenant.id = :tenantId")
    List<EmployeeGLAccount> findAllByTenant(Long tenantId);

    @Query("SELECT e FROM EmployeeGLAccount e WHERE e.employeeId = :employeeId AND e.tenant.id = :tenantId")
    Optional<EmployeeGLAccount> findByEmployeeIdAndTenantId(Long employeeId, Long tenantId);
}
