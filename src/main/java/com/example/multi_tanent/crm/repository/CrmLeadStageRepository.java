package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmLeadStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrmLeadStageRepository extends JpaRepository<CrmLeadStage, Long> {
    List<CrmLeadStage> findByTenantId(Long tenantId);
    List<CrmLeadStage> findByTenantIdOrderBySortOrderAscIdAsc(Long tenantId);

    Optional<CrmLeadStage> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);

    Optional<CrmLeadStage> findFirstByTenantIdAndIsDefaultTrue(Long tenantId);

    Optional<CrmLeadStage> findFirstByTenantIdOrderBySortOrderDesc(Long tenantId);

    Optional<CrmLeadStage> findFirstByTenantIdAndSortOrderLessThanOrderBySortOrderDesc(Long tenantId,
            Integer sortOrder);

    Optional<CrmLeadStage> findFirstByTenantIdAndSortOrderGreaterThanOrderBySortOrderAsc(Long tenantId,
            Integer sortOrder);

    Optional<CrmLeadStage> findByTenantIdAndIsConvertedTrue(Long tenantId);

    Optional<CrmLeadStage> findByTenantIdAndIsWonTrue(Long tenantId);

    Optional<CrmLeadStage> findByTenantIdAndIsMqlTrue(Long tenantId);

    Optional<CrmLeadStage> findByTenantIdAndIsSqlTrue(Long tenantId);
}