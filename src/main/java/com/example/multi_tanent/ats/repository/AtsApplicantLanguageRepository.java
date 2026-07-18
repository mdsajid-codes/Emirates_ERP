package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicantLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsApplicantLanguageRepository extends JpaRepository<AtsApplicantLanguage, Long> {
    List<AtsApplicantLanguage> findByApplicantIdAndTenantId(Long applicantId, Long tenantId);
    Optional<AtsApplicantLanguage> findByIdAndApplicantIdAndTenantId(Long id, Long applicantId, Long tenantId);
}
