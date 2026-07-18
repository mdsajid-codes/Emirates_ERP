package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicantEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsApplicantEducationRepository extends JpaRepository<AtsApplicantEducation, Long> {
    List<AtsApplicantEducation> findByApplicantIdAndTenantId(Long applicantId, Long tenantId);
    Optional<AtsApplicantEducation> findByIdAndApplicantIdAndTenantId(Long id, Long applicantId, Long tenantId);
}
