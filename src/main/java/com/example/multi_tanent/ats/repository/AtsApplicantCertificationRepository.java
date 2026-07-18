package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicantCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsApplicantCertificationRepository extends JpaRepository<AtsApplicantCertification, Long> {
    List<AtsApplicantCertification> findByApplicantIdAndTenantId(Long applicantId, Long tenantId);
    Optional<AtsApplicantCertification> findByIdAndApplicantIdAndTenantId(Long id, Long applicantId, Long tenantId);
}
