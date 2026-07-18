package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicantWorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsApplicantWorkExperienceRepository extends JpaRepository<AtsApplicantWorkExperience, Long> {
    List<AtsApplicantWorkExperience> findByApplicantIdAndTenantId(Long applicantId, Long tenantId);
    Optional<AtsApplicantWorkExperience> findByIdAndApplicantIdAndTenantId(Long id, Long applicantId, Long tenantId);
}
