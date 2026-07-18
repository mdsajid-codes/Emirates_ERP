package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngCoatingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngCoatingLogRepository extends JpaRepository<HngCoatingLog, Long> {
    List<HngCoatingLog> findByBatchIdAndTenantId(Long batchId, Long tenantId);

    Optional<HngCoatingLog> findByIdAndTenantId(Long id, Long tenantId);
}
