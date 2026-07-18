package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsVendorNoteRepository extends JpaRepository<AtsVendorNote, Long> {
    List<AtsVendorNote> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorNote> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
}
