package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsPaymentTerms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsPaymentTermsRepository extends JpaRepository<AtsPaymentTerms, Long> {
    List<AtsPaymentTerms> findByTenantIdAndIsActiveTrue(Long tenantId);
    Page<AtsPaymentTerms> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsPaymentTerms> findByTenantId(Long tenantId);
    Optional<AtsPaymentTerms> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
}
