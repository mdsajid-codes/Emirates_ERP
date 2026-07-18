package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicantEmployer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsApplicantEmployerRepository extends JpaRepository<AtsApplicantEmployer, Long> {
    List<AtsApplicantEmployer> findByApplicantIdAndTenantId(Long applicantId, Long tenantId);
    Optional<AtsApplicantEmployer> findByIdAndApplicantIdAndTenantId(Long id, Long applicantId, Long tenantId);
}
