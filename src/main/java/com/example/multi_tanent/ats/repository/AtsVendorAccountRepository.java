package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsVendorAccountRepository extends JpaRepository<AtsVendorAccount, Long> {
    Optional<AtsVendorAccount> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
}
