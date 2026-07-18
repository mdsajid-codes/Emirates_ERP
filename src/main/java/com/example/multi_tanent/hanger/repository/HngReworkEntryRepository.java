package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngReworkEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngReworkEntryRepository extends JpaRepository<HngReworkEntry, Long> {
    List<HngReworkEntry> findByBatchIdAndTenantId(Long batchId, Long tenantId);

    Optional<HngReworkEntry> findByIdAndTenantId(Long id, Long tenantId);
}
