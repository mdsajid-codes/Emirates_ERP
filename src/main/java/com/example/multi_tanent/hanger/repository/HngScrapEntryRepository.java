package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngScrapEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HngScrapEntryRepository extends JpaRepository<HngScrapEntry, Long> {
    List<HngScrapEntry> findByBatchIdAndTenantId(Long batchId, Long tenantId);

    List<HngScrapEntry> findByWireProcessingId(Long wireProcessingId);
}
