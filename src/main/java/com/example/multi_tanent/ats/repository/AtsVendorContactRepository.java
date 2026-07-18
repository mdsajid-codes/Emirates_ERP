package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AtsVendorContactRepository extends JpaRepository<AtsVendorContact, Long> {
    List<AtsVendorContact> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorContact> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
    Optional<AtsVendorContact> findByIdAndTenantId(Long id, Long tenantId);
    
    @Query("SELECT vc FROM AtsVendorContact vc LEFT JOIN vc.vendor v " +
           "WHERE vc.tenant.id = :tenantId AND (" +
           "LOWER(vc.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(vc.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(vc.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.companyName) LIKE LOWER(CONCAT('%', :q, '%'))" +
           ")")
    List<AtsVendorContact> searchContacts(@Param("tenantId") Long tenantId, @Param("q") String q);

    @Query("SELECT vc FROM AtsVendorContact vc WHERE vc.tenant.id = :tenantId AND vc.isBlacklisted = true AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(vc.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(vc.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(vc.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(vc.mobile) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsVendorContact> findBlacklisted(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);
}
