package com.example.multi_tanent.crm.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmTaskStage;



public interface CrmTaskStageRepository extends JpaRepository<CrmTaskStage, Long> {

    List<CrmTaskStage> findByTenantIdOrderBySortOrderAscIdAsc(Long tenantId);

    Optional<CrmTaskStage> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndStatusNameIgnoreCase(Long tenantId, String statusName);

    Optional<CrmTaskStage> findFirstByTenantIdAndIsDefaultTrue(Long tenantId);

    Optional<CrmTaskStage> findFirstByTenantIdOrderBySortOrderDesc(Long tenantId);

    Optional<CrmTaskStage> findFirstByTenantIdAndSortOrderLessThanOrderBySortOrderDesc(Long tenantId, Integer sortOrder);
    Optional<CrmTaskStage> findFirstByTenantIdAndSortOrderGreaterThanOrderBySortOrderAsc(Long tenantId, Integer sortOrder);
}