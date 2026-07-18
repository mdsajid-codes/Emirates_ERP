package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngCostRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HngCostRateRepository extends JpaRepository<HngCostRate, Long> {
    List<HngCostRate> findByTenantIdAndIsActiveTrue(Long tenantId);

    Optional<HngCostRate> findByIdAndTenantId(Long id, Long tenantId);

    List<HngCostRate> findByTenantId(Long tenantId);
}
