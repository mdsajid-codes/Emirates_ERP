package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngBatchWireProcessing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HngBatchWireProcessingRepository extends JpaRepository<HngBatchWireProcessing, Long> {
    List<HngBatchWireProcessing> findByBatchId(Long batchId);

    List<HngBatchWireProcessing> findByBatchIdAndTenantId(Long batchId, Long tenantId);
}
