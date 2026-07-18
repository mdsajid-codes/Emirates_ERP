package com.example.multi_tanent.accounts.repository.vat;

import com.example.multi_tanent.accounts.entity.vat.VatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VatTypeRepository extends JpaRepository<VatType, Long> {
    List<VatType> findByTenantId(String tenantId);
    List<VatType> findByVatGroupIdAndTenantId(Long vatGroupId, String tenantId);
    Optional<VatType> findByIdAndTenantId(Long id, String tenantId);
}
