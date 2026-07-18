package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngProductionBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngProductionBatchRepository extends JpaRepository<HngProductionBatch, Long> {
    Page<HngProductionBatch> findByTenantId(Long tenantId, Pageable pageable);

    List<HngProductionBatch> findByMoIdAndTenantId(Long moId, Long tenantId);

    Optional<HngProductionBatch> findByIdAndTenantId(Long id, Long tenantId);

    List<HngProductionBatch> findByTenantIdAndStatusIn(Long tenantId,
            java.util.Collection<com.example.multi_tanent.hanger.enums.BatchStatus> statuses);

    long countByTenantIdAndStatus(Long tenantId, com.example.multi_tanent.hanger.enums.BatchStatus status);

    long countByTenantId(Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT b.currentStage, COUNT(b) FROM HngProductionBatch b WHERE b.tenant.id = :tenantId GROUP BY b.currentStage")
    java.util.List<Object[]> countByStageForTenant(Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM HngProductionBatch b WHERE b.tenant.id = :tenantId ORDER BY b.createdAt DESC")
    java.util.List<com.example.multi_tanent.hanger.entity.HngProductionBatch> findTop5ByTenantIdOrderByCreatedAtDesc(
            Long tenantId, org.springframework.data.domain.Pageable pageable);
}
