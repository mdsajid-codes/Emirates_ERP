package com.example.multi_tanent.sales.repository;

import com.example.multi_tanent.sales.entity.SalesDocTemplate;
import com.example.multi_tanent.sales.enums.SalesDocType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesDocTemplateRepository extends JpaRepository<SalesDocTemplate, Long> {
    List<SalesDocTemplate> findByTenantId(Long tenantId);

    List<SalesDocTemplate> findByTenantIdAndDocType(Long tenantId, SalesDocType docType);

    Optional<SalesDocTemplate> findByTenantIdAndId(Long tenantId, Long id);

    Optional<SalesDocTemplate> findByTenantIdAndDocTypeAndIsDefaultTrue(Long tenantId, SalesDocType docType);
}
