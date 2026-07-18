package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AtsClientRepository extends JpaRepository<AtsClient, Long>, JpaSpecificationExecutor<AtsClient> {
    Page<AtsClient> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsClient> findByTenantId(Long tenantId);
    Optional<AtsClient> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByClientNameAndTenantId(String clientName, Long tenantId);

    @Query("SELECT c FROM AtsClient c WHERE c.tenant.id = :tenantId AND c.isBlacklisted = true AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.clientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.emailId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.contactNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsClient> findBlacklisted(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);
}
