// package com.example.multi_tanent.crm.repository;

// import com.example.multi_tanent.crm.entity.CrmLead;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.List;
// import java.util.Optional;

// public interface CrmLeadRepository extends JpaRepository<CrmLead, Long> {
//     Page<CrmLead> findByTenantId(Long tenantId, Pageable pageable);
//     Optional<CrmLead> findByIdAndTenantId(Long id, Long tenantId);
// }
package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmLead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import com.example.multi_tanent.crm.enums.CrmLeadStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface CrmLeadRepository extends JpaRepository<CrmLead, Long>, JpaSpecificationExecutor<CrmLead> {

    List<CrmLead> findAllByTenantId(Long tenantId);
    Page<CrmLead> findByTenantId(Long tenantId, Pageable pageable);
    Optional<CrmLead> findByIdAndTenantId(Long id, Long tenantId);

    long countByTenantId(Long tenantId);
    long countByTenantIdAndCreatedAtAfter(Long tenantId, OffsetDateTime date);
    long countByTenantIdAndOwnerIsNull(Long tenantId);
    long countByTenantIdAndStatus(Long tenantId, CrmLeadStatus status);
    long countByTenantIdAndStatusIn(Long tenantId, List<CrmLeadStatus> statuses);

    @Query("SELECT count(DISTINCT l.id) FROM CrmLead l JOIN l.tasks t WHERE l.tenant.id = :tenantId AND t.status <> 'COMPLETED'")
    long countLeadsWithPendingTasks(Long tenantId);

    @Query("SELECT count(l) FROM CrmLead l WHERE l.tenant.id = :tenantId AND l.status NOT IN :excludedStatuses")
    long countByTenantIdAndStatusNotIn(Long tenantId, List<CrmLeadStatus> excludedStatuses);
    boolean existsByTenantIdAndLeadNo(Long tenantId, String leadNo);
    Optional<CrmLead> findByTenantIdAndLeadNo(Long tenantId, String leadNo);
    List<CrmLead> findTop5ByTenantIdOrderByCreatedAtDesc(Long tenantId);

    @Query("SELECT COALESCE(l.currentStage.name, 'Unassigned') AS label, COUNT(l) AS count FROM CrmLead l WHERE l.tenant.id = :tenantId GROUP BY l.currentStage.name")
    List<Object[]> countByStage(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(CONCAT(l.owner.firstName, ' ', l.owner.lastName), 'Unassigned') AS label, COUNT(l) AS count FROM CrmLead l WHERE l.tenant.id = :tenantId GROUP BY l.owner.id, l.owner.firstName, l.owner.lastName")
    List<Object[]> countByOwner(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @Query("SELECT CASE WHEN l.status IS NULL THEN 'Unknown' ELSE CAST(l.status as string) END AS label, COUNT(l) AS count FROM CrmLead l WHERE l.tenant.id = :tenantId GROUP BY l.status")
    List<Object[]> countByStatus(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(l.leadSource.name, 'Direct / Organic') AS label, COUNT(l) AS count FROM CrmLead l WHERE l.tenant.id = :tenantId GROUP BY l.leadSource.name")
    List<Object[]> countBySource(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(l.industry.name, 'Unassigned') AS label, COUNT(l) AS count FROM CrmLead l WHERE l.tenant.id = :tenantId GROUP BY l.industry.name")
    List<Object[]> countByIndustry(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(l.currentStage.name, 'Closed / Disqualified') AS label, COUNT(l) AS count FROM CrmLead l WHERE l.tenant.id = :tenantId AND l.status = com.example.multi_tanent.crm.enums.CrmLeadStatus.LOST GROUP BY l.currentStage.name")
    List<Object[]> countLostByStage(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);
}
