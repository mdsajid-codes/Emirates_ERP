package com.example.multi_tanent.purchases.repository;

import com.example.multi_tanent.purchases.entity.PurRequisition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurRequisitionRepository extends JpaRepository<PurRequisition, Long> {
    Page<PurRequisition> findByTenantId(Long tenantId, Pageable pageable);
    Optional<PurRequisition> findByIdAndTenantId(Long id, Long tenantId);
    Optional<PurRequisition> findByRequisitionNumberAndTenantId(String requisitionNumber, Long tenantId);
}
