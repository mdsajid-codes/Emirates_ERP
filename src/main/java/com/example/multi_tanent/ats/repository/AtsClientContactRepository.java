package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AtsClientContactRepository extends JpaRepository<AtsClientContact, Long> {
    List<AtsClientContact> findByClientIdAndTenantId(Long clientId, Long tenantId);
    Optional<AtsClientContact> findByIdAndClientIdAndTenantId(Long id, Long clientId, Long tenantId);
    Optional<AtsClientContact> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT cc FROM AtsClientContact cc WHERE cc.tenant.id = :tenantId AND cc.isBlacklisted = true AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(cc.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(cc.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(cc.emailId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(cc.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsClientContact> findBlacklisted(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);
}
