package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicantConsent;
import com.example.multi_tanent.ats.enums.ConsentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsConsentRepository extends JpaRepository<AtsApplicantConsent, Long> {

    @Query("SELECT c FROM AtsApplicantConsent c WHERE c.tenant.id = :tenantId AND c.consentStatus = :status AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.applicant.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.applicant.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.applicant.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsApplicantConsent> findByTenantIdAndConsentStatus(
            @Param("tenantId") Long tenantId,
            @Param("status") ConsentStatus status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT DISTINCT c FROM AtsApplicantConsent c " +
           "JOIN c.applicant a " +
           "JOIN a.documents d " +
           "WHERE c.tenant.id = :tenantId AND c.consentStatus = com.example.multi_tanent.ats.enums.ConsentStatus.ACCEPTED " +
           "AND d.verificationStatus = 'PENDING' AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsApplicantConsent> findVerificationPendingConsents(
            @Param("tenantId") Long tenantId,
            @Param("search") String search,
            Pageable pageable);

    Optional<AtsApplicantConsent> findByConsentToken(String consentToken);
    
    Optional<AtsApplicantConsent> findByApplicantIdAndTenantId(Long applicantId, Long tenantId);
}
