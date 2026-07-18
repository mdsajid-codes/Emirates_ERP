package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientGuidelineDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsClientGuidelineDocumentRepository extends JpaRepository<AtsClientGuidelineDocument, Long> {
    List<AtsClientGuidelineDocument> findByGuidelineIdAndTenantId(Long guidelineId, Long tenantId);
    Optional<AtsClientGuidelineDocument> findByIdAndGuidelineIdAndTenantId(Long id, Long guidelineId, Long tenantId);
}
