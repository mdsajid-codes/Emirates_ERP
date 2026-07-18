package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsActionRepository extends JpaRepository<AtsAction, Long> {
    List<AtsAction> findByTenantIdAndIsActiveTrue(Long tenantId);
    Page<AtsAction> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsAction> findByTenantId(Long tenantId);
    Optional<AtsAction> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
}
