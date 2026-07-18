package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendorBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsVendorBankAccountRepository extends JpaRepository<AtsVendorBankAccount, Long> {
    List<AtsVendorBankAccount> findByVendorIdAndTenantId(Long vendorId, Long tenantId);
    Optional<AtsVendorBankAccount> findByIdAndVendorIdAndTenantId(Long id, Long vendorId, Long tenantId);
}
