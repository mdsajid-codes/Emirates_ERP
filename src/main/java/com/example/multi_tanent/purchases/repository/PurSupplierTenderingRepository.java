package com.example.multi_tanent.purchases.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurSupplierTendering;

import java.util.List;
import java.util.Optional;

public interface PurSupplierTenderingRepository extends JpaRepository<PurSupplierTendering, Long> {
    Page<PurSupplierTendering> findByTenantId(Long tenantId, Pageable pageable);
    List<PurSupplierTendering> findByTenantId(Long tenantId);
    Optional<PurSupplierTendering> findByIdAndTenantId(Long id, Long tenantId);
}
