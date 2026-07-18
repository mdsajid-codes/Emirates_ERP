package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.enums.ApplicantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AtsApplicantRepository extends JpaRepository<AtsApplicant, Long>, JpaSpecificationExecutor<AtsApplicant> {
    Page<AtsApplicant> findByTenantId(Long tenantId, Pageable pageable);
    Optional<AtsApplicant> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByEmailAndTenantId(String email, Long tenantId);
    Page<AtsApplicant> findByTenantIdAndApplicantStatus(Long tenantId, ApplicantStatus status, Pageable pageable);

    @Query("SELECT a FROM AtsApplicant a WHERE a.tenant.id = :tenantId AND a.isBlacklisted = true AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsApplicant> findBlacklisted(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);
}
