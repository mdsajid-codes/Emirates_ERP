package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorSubmissionFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsVendorSubmissionFormatRepository extends JpaRepository<AtsVendorSubmissionFormat, Long> {
    Optional<AtsVendorSubmissionFormat> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
}
