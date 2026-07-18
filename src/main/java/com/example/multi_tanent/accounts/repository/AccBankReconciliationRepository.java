package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccBankReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccBankReconciliationRepository extends JpaRepository<AccBankReconciliation, Long> {
    List<AccBankReconciliation> findByBankAccountIdAndTenantId(Long bankAccountId, String tenantId);
    List<AccBankReconciliation> findByTenantId(String tenantId);
}
