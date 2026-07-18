package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsClientDocumentRepository extends JpaRepository<AtsClientDocument, Long> {
    List<AtsClientDocument> findByClientIdAndTenantId(Long clientId, Long tenantId);
    Optional<AtsClientDocument> findByIdAndClientIdAndTenantId(Long id, Long clientId, Long tenantId);
}
