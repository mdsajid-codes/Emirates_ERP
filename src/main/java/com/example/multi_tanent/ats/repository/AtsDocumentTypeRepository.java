package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsDocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsDocumentTypeRepository extends JpaRepository<AtsDocumentType, Long> {
    Page<AtsDocumentType> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsDocumentType> findByTenantId(Long tenantId);
    Optional<AtsDocumentType> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
}
