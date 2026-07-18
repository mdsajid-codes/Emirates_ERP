package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorContract;
import com.example.multi_tanent.ats.enums.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsVendorContractRepository extends JpaRepository<AtsVendorContract, Long> {
    List<AtsVendorContract> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorContract> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
    List<AtsVendorContract> findByVendorIdAndTenantIdAndContractStatus(Long vendorId, Long tenantId, ContractStatus status);
}
