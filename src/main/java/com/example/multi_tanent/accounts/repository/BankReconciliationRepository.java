package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.BankReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankReconciliationRepository extends JpaRepository<BankReconciliation, Long> {

    @Query("SELECT b FROM BankReconciliation b WHERE b.tenant.id = :tenantId AND b.bankAccountId = :bankAccountId ORDER BY b.statementDate DESC")
    List<BankReconciliation> findByBankAccountIdOrderByStatementDateDesc(Long bankAccountId, Long tenantId);
}
