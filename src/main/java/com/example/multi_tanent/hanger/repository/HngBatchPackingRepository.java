package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngBatchPacking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngBatchPackingRepository extends JpaRepository<HngBatchPacking, Long> {
    List<HngBatchPacking> findByBatch_IdAndTenantId(Long batchId, Long tenantId);

    Optional<HngBatchPacking> findByIdAndTenantId(Long id, Long tenantId);

    List<HngBatchPacking> findTop10ByTenant_IdOrderByCreatedAtDesc(Long tenantId);

    long countByTenant_Id(Long tenantId);
}
