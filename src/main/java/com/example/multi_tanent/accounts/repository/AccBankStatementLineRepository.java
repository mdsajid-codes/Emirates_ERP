package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccBankStatementLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccBankStatementLineRepository extends JpaRepository<AccBankStatementLine, Long> {
    List<AccBankStatementLine> findByReconciliationIdAndTenantId(Long reconciliationId, String tenantId);
}
