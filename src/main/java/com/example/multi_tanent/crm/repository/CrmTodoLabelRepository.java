package com.example.multi_tanent.crm.repository;




import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmTodoLabel;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CrmTodoLabelRepository extends JpaRepository<CrmTodoLabel, Long> {
    List<CrmTodoLabel> findByTenantIdOrderByNameAsc(Long tenantId);
    Optional<CrmTodoLabel> findByIdAndTenantId(Long id, Long tenantId);
    List<CrmTodoLabel> findAllByIdInAndTenantId(Collection<Long> ids, Long tenantId);
}
