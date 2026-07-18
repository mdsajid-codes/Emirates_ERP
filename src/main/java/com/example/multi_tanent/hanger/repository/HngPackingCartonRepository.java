package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngPackingCarton;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface HngPackingCartonRepository extends JpaRepository<HngPackingCarton, Long> {
    List<HngPackingCarton> findByPacking_IdAndTenantId(Long packingId, Long tenantId);

    long countByTenant_IdAndCreatedAtAfter(Long tenantId, OffsetDateTime since);
}
