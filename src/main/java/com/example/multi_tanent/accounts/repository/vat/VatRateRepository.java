package com.example.multi_tanent.accounts.repository.vat;

import com.example.multi_tanent.accounts.entity.vat.VatRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VatRateRepository extends JpaRepository<VatRate, Long> {
    List<VatRate> findByTenantId(String tenantId);
    Optional<VatRate> findByIdAndTenantId(Long id, String tenantId);
}
