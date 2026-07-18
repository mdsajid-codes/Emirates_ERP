package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.BankReconciliationMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankReconciliationMatchRepository extends JpaRepository<BankReconciliationMatch, Long> {
    List<BankReconciliationMatch> findByReconciliationId(Long reconciliationId);
    List<BankReconciliationMatch> findByJournalEntryLine_LineIdIn(List<Long> lineIds);
}
