package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngQcLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngQcLogRepository extends JpaRepository<HngQcLog, Long> {
    List<HngQcLog> findByBatch_IdAndTenantId(Long batchId, Long tenantId);

    Optional<HngQcLog> findByIdAndTenantId(Long id, Long tenantId);
}
