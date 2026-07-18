package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsVendorTaskRepository extends JpaRepository<AtsVendorTask, Long> {
    List<AtsVendorTask> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorTask> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
    List<AtsVendorTask> findByAssignedToIdAndTenantId(Long assignedToId, Long tenantId);
}
