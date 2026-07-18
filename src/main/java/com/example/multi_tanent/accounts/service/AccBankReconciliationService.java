package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.reconciliation.BankReconciliationRequest;
import com.example.multi_tanent.accounts.dto.reconciliation.BankReconciliationResponse;

import java.util.List;

public interface AccBankReconciliationService {
    BankReconciliationResponse startReconciliation(BankReconciliationRequest request, String tenantId);
    BankReconciliationResponse autoMatch(Long id, String tenantId);
    BankReconciliationResponse resolveDiscrepancy(Long lineId, Long journalEntryId, String tenantId);
    BankReconciliationResponse completeReconciliation(Long id, String tenantId);
    BankReconciliationResponse importMockLines(Long id, String tenantId);
    BankReconciliationResponse getReconciliation(Long id, String tenantId);
    List<BankReconciliationResponse> getReconciliationsByBank(Long bankAccountId, String tenantId);
}
