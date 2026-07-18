package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.dto.CrmTodoSubjectCount;
import com.example.multi_tanent.crm.entity.CrmTodoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CrmTodoRepository extends JpaRepository<CrmTodoItem, Long>, JpaSpecificationExecutor<CrmTodoItem> {

    Optional<CrmTodoItem> findByIdAndTenantId(Long id, Long tenantId);

    List<CrmTodoItem> findByTenantId(Long tenantId);

    @Query("""
            SELECT new com.example.multi_tanent.crm.dto.CrmTodoSubjectCount(t.subject, COUNT(t))
            FROM CrmTodoItem t
            WHERE t.tenant.id = :tenantId
            GROUP BY t.subject
            """)
    List<CrmTodoSubjectCount> countBySubjectForTenant(Long tenantId);
}