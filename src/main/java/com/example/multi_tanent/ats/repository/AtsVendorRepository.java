package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.enums.VendorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AtsVendorRepository extends JpaRepository<AtsVendor, Long>, JpaSpecificationExecutor<AtsVendor> {
    Page<AtsVendor> findByTenantId(Long tenantId, Pageable pageable);
    java.util.List<AtsVendor> findByTenantId(Long tenantId);
    Optional<AtsVendor> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByPrimaryEmailAndTenantId(String email, Long tenantId);
    boolean existsByVendorCodeAndTenantId(String code, Long tenantId);
    Page<AtsVendor> findByTenantIdAndVendorStatus(Long tenantId, VendorStatus status, Pageable pageable);

    @Query("SELECT v FROM AtsVendor v WHERE v.tenant.id = :tenantId AND v.isBlacklisted = true AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(v.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.primaryEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.primaryPhone) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsVendor> findBlacklisted(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);
}
