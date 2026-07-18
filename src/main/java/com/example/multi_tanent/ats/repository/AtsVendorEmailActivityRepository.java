package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorEmailActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsVendorEmailActivityRepository extends JpaRepository<AtsVendorEmailActivity, Long> {
    List<AtsVendorEmailActivity> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorEmailActivity> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
}
