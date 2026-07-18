package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsVendorDocumentRepository extends JpaRepository<AtsVendorDocument, Long> {
    List<AtsVendorDocument> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorDocument> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
}
