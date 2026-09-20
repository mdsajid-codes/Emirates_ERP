package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.PosPeriodLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PosPeriodLockRepository extends JpaRepository<PosPeriodLock, Long> {
    List<PosPeriodLock> findByTenantId(String tenantId);
    Optional<PosPeriodLock> findByTenantIdAndPeriodName(String tenantId, String periodName);
}
