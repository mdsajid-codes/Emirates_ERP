package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsAiProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsAiProviderRepository extends JpaRepository<AtsAiProvider, Long> {
    Page<AtsAiProvider> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsAiProvider> findByTenantId(Long tenantId);
    Optional<AtsAiProvider> findByTenantIdAndIsActiveTrue(Long tenantId);
    Optional<AtsAiProvider> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByProviderNameAndTenantId(String providerName, Long tenantId);
}
