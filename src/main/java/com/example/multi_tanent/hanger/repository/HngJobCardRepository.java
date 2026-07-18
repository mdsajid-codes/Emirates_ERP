package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngJobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngJobCardRepository extends JpaRepository<HngJobCard, Long> {
    List<HngJobCard> findByBatchIdAndTenantId(Long batchId, Long tenantId);

    List<HngJobCard> findByTenantId(Long tenantId);

    Optional<HngJobCard> findByIdAndTenantId(Long id, Long tenantId);
}
