package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.TaxRate;

import java.util.List;
import java.util.Optional;

public interface TaxRateRepository extends JpaRepository<TaxRate, Long> {
    List<TaxRate> findByTenantId(Long tenantId);
    Optional<TaxRate> findByIdAndTenantId(Long id, Long tenantId);
}
