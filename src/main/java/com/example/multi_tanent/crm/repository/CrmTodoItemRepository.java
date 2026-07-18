package com.example.multi_tanent.crm.repository;




import com.example.multi_tanent.crm.entity.CrmTodoItem;
import com.example.multi_tanent.crm.enums.TaskSubject;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CrmTodoItemRepository extends JpaRepository<CrmTodoItem, Long>, JpaSpecificationExecutor<CrmTodoItem> {
    Optional<CrmTodoItem> findByIdAndTenantId(Long id, Long tenantId);

    @Query("select t.subject as subject, count(t) as cnt from CrmTodoItem t where t.tenant.id = :tenantId group by t.subject")
    List<Object[]> countBySubject(@Param("tenantId") Long tenantId);
}
