package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.reconciliation.BankReconciliationRequest;
import com.example.multi_tanent.accounts.dto.reconciliation.BankReconciliationResponse;
import com.example.multi_tanent.accounts.dto.reconciliation.BankStatementLineResponse;
import com.example.multi_tanent.accounts.entity.AccBankAccount;
import com.example.multi_tanent.accounts.entity.AccBankReconciliation;
import com.example.multi_tanent.accounts.entity.AccBankStatementLine;
import com.example.multi_tanent.accounts.entity.enums.ReconciliationStatus;
import com.example.multi_tanent.accounts.repository.AccBankAccountRepository;
import com.example.multi_tanent.accounts.repository.AccBankReconciliationRepository;
import com.example.multi_tanent.accounts.repository.AccBankStatementLineRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryLineRepository;
import com.example.multi_tanent.accounts.service.AccBankReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccBankReconciliationServiceImpl implements AccBankReconciliationService {

    private final AccBankReconciliationRepository reconciliationRepository;
    private final AccBankStatementLineRepository statementLineRepository;
    private final AccBankAccountRepository bankAccountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Override
    @Transactional
    public BankReconciliationResponse startReconciliation(BankReconciliationRequest request, String tenantId) {
        AccBankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new RuntimeException("Bank Account not found"));

        if (!bankAccount.getTenantId().equals(tenantId)) throw new RuntimeException("Bank Account not found for tenant");

        AccBankReconciliation reconciliation = AccBankReconciliation.builder()
                .bankAccount(bankAccount)
                .statementDate(request.getStatementDate())
                .statementBalance(request.getStatementBalance())
                .status(ReconciliationStatus.DRAFT)
                .tenantId(tenantId)
                .build();

        if (request.getLines() != null) {
            for (var lineReq : request.getLines()) {
                AccBankStatementLine line = AccBankStatementLine.builder()
                        .transactionDate(lineReq.getTransactionDate())
                        .amount(lineReq.getAmount())
                        .description(lineReq.getDescription())
                        .isReconciled(false)
                        .tenantId(tenantId)
                        .build();
                reconciliation.addLine(line);
            }
        }

        reconciliationRepository.save(reconciliation);
        return mapToResponse(reconciliation);
    }

    @Override
    @Transactional
    public BankReconciliationResponse autoMatch(Long id, String tenantId) {
        AccBankReconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reconciliation not found"));
        if (!reconciliation.getTenantId().equals(tenantId)) throw new RuntimeException("Not found for tenant");

        Long glAccountId = reconciliation.getBankAccount().getGlAccount().getAccountId();
        
        List<com.example.multi_tanent.accounts.entity.journal.JournalEntryLine> unReconciledLines =
            journalEntryLineRepository.findUnreconciledLinesByAccountId(glAccountId);
            
        for (AccBankStatementLine stmtLine : reconciliation.getLines()) {
            if (stmtLine.getIsReconciled()) continue;

            for (com.example.multi_tanent.accounts.entity.journal.JournalEntryLine glLine : unReconciledLines) {
                if (glLine.getJournalEntry() == null) continue;

                // Match amount: statement line amount (positive for deposit, negative for withdrawal)
                // GL line: Debit increases bank balance (positive), Credit decreases (negative)
                BigDecimal glAmount = BigDecimal.ZERO;
                if (glLine.getDebitAmount() != null && glLine.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
                    glAmount = glLine.getDebitAmount();
                } else if (glLine.getCreditAmount() != null && glLine.getCreditAmount().compareTo(BigDecimal.ZERO) > 0) {
                    glAmount = glLine.getCreditAmount().negate();
                }

                if (stmtLine.getAmount().compareTo(glAmount) == 0) {
                    // Match date: simplified to exact date match for now
                    if (stmtLine.getTransactionDate().equals(glLine.getJournalEntry().getEntryDate())) {
                        stmtLine.setLinkedJournal(glLine.getJournalEntry());
                        stmtLine.setIsReconciled(true);
                        statementLineRepository.save(stmtLine);
                        break;
                    }
                }
            }
        }

        reconciliationRepository.save(reconciliation);
        return mapToResponse(reconciliation);
    }

    @Override
    @Transactional
    public BankReconciliationResponse resolveDiscrepancy(Long lineId, Long journalEntryId, String tenantId) {
        AccBankStatementLine line = statementLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Statement line not found"));
        if (!line.getTenantId().equals(tenantId)) throw new RuntimeException("Not found for tenant");

        com.example.multi_tanent.accounts.entity.journal.JournalEntry je = journalEntryRepository.findById(journalEntryId)
                .orElseThrow(() -> new RuntimeException("Journal Entry not found"));

        line.setLinkedJournal(je);
        line.setIsReconciled(true);
        statementLineRepository.save(line);

        return mapToResponse(line.getReconciliation());
    }

    @Override
    @Transactional
    public BankReconciliationResponse importMockLines(Long id, String tenantId) {
        AccBankReconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reconciliation not found"));
        if (!reconciliation.getTenantId().equals(tenantId)) throw new RuntimeException("Not found for tenant");

        AccBankStatementLine line1 = AccBankStatementLine.builder()
                .reconciliation(reconciliation)
                .transactionDate(java.time.LocalDate.parse("2026-06-08"))
                .amount(new java.math.BigDecimal("100"))
                .description("Mock Deposit 1")
                .isReconciled(false)
                .tenantId(tenantId)
                .build();

        AccBankStatementLine line2 = AccBankStatementLine.builder()
                .reconciliation(reconciliation)
                .transactionDate(java.time.LocalDate.parse("2026-06-09"))
                .amount(new java.math.BigDecimal("682.5"))
                .description("Mock Deposit 2")
                .isReconciled(false)
                .tenantId(tenantId)
                .build();

        AccBankStatementLine line3 = AccBankStatementLine.builder()
                .reconciliation(reconciliation)
                .transactionDate(java.time.LocalDate.parse("2026-06-13"))
                .amount(new java.math.BigDecimal("210"))
                .description("Customer Payment")
                .isReconciled(false)
                .tenantId(tenantId)
                .build();

        statementLineRepository.save(line1);
        statementLineRepository.save(line2);
        statementLineRepository.save(line3);

        if (reconciliation.getLines() == null) {
            reconciliation.setLines(new java.util.ArrayList<>());
        }
        reconciliation.getLines().add(line1);
        reconciliation.getLines().add(line2);
        reconciliation.getLines().add(line3);

        reconciliationRepository.save(reconciliation);
        return mapToResponse(reconciliation);
    }

    @Override
    @Transactional
    public BankReconciliationResponse completeReconciliation(Long id, String tenantId) {
        AccBankReconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reconciliation not found"));
        if (!reconciliation.getTenantId().equals(tenantId)) throw new RuntimeException("Not found for tenant");

        boolean allReconciled = reconciliation.getLines().stream().allMatch(AccBankStatementLine::getIsReconciled);
        if (!allReconciled) {
            throw new RuntimeException("Cannot complete reconciliation. Some lines are not reconciled.");
        }

        // Logic to calculate adjusted GL balance and ensure it matches the statement balance
        // BigDecimal glBalance = ...
        // reconciliation.setGlBalance(glBalance);

        reconciliation.setStatus(ReconciliationStatus.COMPLETED);
        reconciliationRepository.save(reconciliation);
        return mapToResponse(reconciliation);
    }

    @Override
    public BankReconciliationResponse getReconciliation(Long id, String tenantId) {
        AccBankReconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reconciliation not found"));
        if (!reconciliation.getTenantId().equals(tenantId)) throw new RuntimeException("Not found for tenant");
        return mapToResponse(reconciliation);
    }

    @Override
    public List<BankReconciliationResponse> getReconciliationsByBank(Long bankAccountId, String tenantId) {
        return reconciliationRepository.findByBankAccountIdAndTenantId(bankAccountId, tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BankReconciliationResponse mapToResponse(AccBankReconciliation reconciliation) {
        BankReconciliationResponse res = new BankReconciliationResponse();
        res.setId(reconciliation.getId());
        res.setBankAccountId(reconciliation.getBankAccount().getId());
        res.setStatementDate(reconciliation.getStatementDate());
        res.setStatementBalance(reconciliation.getStatementBalance());
        res.setGlBalance(reconciliation.getGlBalance());
        res.setStatus(reconciliation.getStatus());
        res.setTenantId(reconciliation.getTenantId());

        if (reconciliation.getLines() != null) {
            res.setStatementLines(reconciliation.getLines().stream().map(line -> {
                BankStatementLineResponse lRes = new BankStatementLineResponse();
                lRes.setId(line.getId());
                lRes.setTransactionDate(line.getTransactionDate());
                lRes.setAmount(line.getAmount());
                lRes.setDescription(line.getDescription());
                lRes.setIsReconciled(line.getIsReconciled());
                lRes.setLinkedJournalId(line.getLinkedJournal() != null ? line.getLinkedJournal().getJournalEntryId() : null);
                lRes.setTenantId(line.getTenantId());
                return lRes;
            }).collect(Collectors.toList()));
        }

        Long glAccountId = reconciliation.getBankAccount().getGlAccount().getAccountId();
        
        List<com.example.multi_tanent.accounts.entity.journal.JournalEntryLine> unReconciledLines =
            journalEntryLineRepository.findUnreconciledLinesByAccountId(glAccountId);
            
        res.setGlLines(unReconciledLines.stream().map(l -> {
            com.example.multi_tanent.accounts.dto.reconciliation.GlLineResponse glRes = new com.example.multi_tanent.accounts.dto.reconciliation.GlLineResponse();
            glRes.setId(l.getLineId());
            glRes.setDate(l.getJournalEntry().getEntryDate());
            glRes.setDescription(l.getDescription());
            java.math.BigDecimal amount = l.getDebitAmount() != null && l.getDebitAmount().compareTo(java.math.BigDecimal.ZERO) > 0 
                    ? l.getDebitAmount() 
                    : (l.getCreditAmount() != null ? l.getCreditAmount().negate() : java.math.BigDecimal.ZERO);
            glRes.setAmount(amount);
            glRes.setIsMatched(false);
            return glRes;
        }).collect(Collectors.toList()));
        
        return res;
    }
}
