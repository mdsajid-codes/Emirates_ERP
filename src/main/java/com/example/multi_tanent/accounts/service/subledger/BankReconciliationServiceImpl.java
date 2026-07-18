package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.BankReconciliationDto;
import com.example.multi_tanent.accounts.entity.BankReconciliation;
import com.example.multi_tanent.accounts.entity.BankReconciliationMatch;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.BankReconciliationMatchRepository;
import com.example.multi_tanent.accounts.repository.BankReconciliationRepository;
import com.example.multi_tanent.accounts.repository.journal.SubLedgerRepository;
import com.example.multi_tanent.accounts.repository.BankGLAccountRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankReconciliationServiceImpl implements BankReconciliationService {

    private final BankReconciliationRepository reconciliationRepository;
    private final BankReconciliationMatchRepository matchRepository;
    private final SubLedgerRepository subLedgerRepository;
    private final BankGLAccountRepository bankGLAccountRepository;
    private final TenantRepository tenantRepository;

    private List<Long> getBankAccountIds(Long tenantId) {
        return bankGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(b -> b.getGlAccount() != null)
                .map(b -> b.getGlAccount().getAccountId())
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BankReconciliationDto createReconciliation(BankReconciliationDto dto, Long tenantId) {
        BankReconciliation reconciliation = BankReconciliation.builder()
                .bankAccountId(dto.getBankAccountId())
                .statementDate(dto.getStatementDate())
                .statementOpeningBalance(dto.getStatementOpeningBalance())
                .statementClosingBalance(dto.getStatementClosingBalance())
                .clearedBalance(dto.getStatementOpeningBalance()) // Starts at opening balance
                .status(BankReconciliation.ReconciliationStatus.DRAFT)
                .tenant(tenantRepository.getReferenceById(tenantId))
                .build();

        reconciliation = reconciliationRepository.save(reconciliation);

        // Fetch uncleared bank statement lines up to statement date
        List<Long> glAccountIds = getBankAccountIds(tenantId);
        List<Object[]> rows = subLedgerRepository.getBankStatementRows(tenantId, glAccountIds, dto.getBankAccountId());
        
        // Very basic: just create matches for ALL rows up to date. In a real app, exclude already cleared.
        for (Object[] row : rows) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];
            
            if (je.getEntryDate().isAfter(dto.getStatementDate())) continue;

            BankReconciliationMatch match = BankReconciliationMatch.builder()
                    .reconciliation(reconciliation)
                    .journalEntryLine(jel)
                    .isCleared(false)
                    .build();
            matchRepository.save(match);
        }

        return getReconciliation(reconciliation.getId(), tenantId);
    }

    @Override
    public BankReconciliationDto getReconciliation(Long id, Long tenantId) {
        BankReconciliation rec = reconciliationRepository.findById(id).orElseThrow();
        List<BankReconciliationMatch> matches = matchRepository.findByReconciliationId(id);

        return BankReconciliationDto.builder()
                .id(rec.getId())
                .bankAccountId(rec.getBankAccountId())
                .statementDate(rec.getStatementDate())
                .statementOpeningBalance(rec.getStatementOpeningBalance())
                .statementClosingBalance(rec.getStatementClosingBalance())
                .clearedBalance(rec.getClearedBalance())
                .status(rec.getStatus())
                .matches(matches.stream().map(m -> {
                    BigDecimal debit = m.getJournalEntryLine().getDebitAmount() != null ? m.getJournalEntryLine().getDebitAmount() : BigDecimal.ZERO;
                    BigDecimal credit = m.getJournalEntryLine().getCreditAmount() != null ? m.getJournalEntryLine().getCreditAmount() : BigDecimal.ZERO;
                    BigDecimal amount = debit.subtract(credit); // Inflows - Outflows

                    return BankReconciliationDto.ReconciliationMatchDto.builder()
                            .matchId(m.getId())
                            .journalEntryLineId(m.getJournalEntryLine().getLineId())
                            .isCleared(m.getIsCleared())
                            .amount(amount)
                            .description(m.getJournalEntryLine().getDescription() != null ? m.getJournalEntryLine().getDescription() : m.getJournalEntryLine().getJournalEntry().getDescription())
                            .entryDate(m.getJournalEntryLine().getJournalEntry().getEntryDate())
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<BankReconciliationDto> getReconciliationsByBank(Long bankAccountId, Long tenantId) {
        return reconciliationRepository.findByBankAccountIdOrderByStatementDateDesc(bankAccountId, tenantId)
                .stream().map(rec -> getReconciliation(rec.getId(), tenantId)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BankReconciliationDto updateMatchStatus(Long matchId, Boolean isCleared, Long tenantId) {
        BankReconciliationMatch match = matchRepository.findById(matchId).orElseThrow();
        BankReconciliation rec = match.getReconciliation();
        
        if (rec.getStatus() == BankReconciliation.ReconciliationStatus.RECONCILED) {
            throw new IllegalStateException("Reconciliation already completed");
        }

        if (!match.getIsCleared().equals(isCleared)) {
            match.setIsCleared(isCleared);
            matchRepository.save(match);
            
            BigDecimal debit = match.getJournalEntryLine().getDebitAmount() != null ? match.getJournalEntryLine().getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = match.getJournalEntryLine().getCreditAmount() != null ? match.getJournalEntryLine().getCreditAmount() : BigDecimal.ZERO;
            BigDecimal amount = debit.subtract(credit);

            if (isCleared) {
                rec.setClearedBalance(rec.getClearedBalance().add(amount));
            } else {
                rec.setClearedBalance(rec.getClearedBalance().subtract(amount));
            }
            reconciliationRepository.save(rec);
        }

        return getReconciliation(rec.getId(), tenantId);
    }

    @Override
    @Transactional
    public BankReconciliationDto completeReconciliation(Long id, Long tenantId) {
        BankReconciliation rec = reconciliationRepository.findById(id).orElseThrow();
        // Check if cleared == statement closing
        if (rec.getClearedBalance().compareTo(rec.getStatementClosingBalance()) != 0) {
            throw new IllegalStateException("Cleared balance does not match statement closing balance.");
        }
        rec.setStatus(BankReconciliation.ReconciliationStatus.RECONCILED);
        reconciliationRepository.save(rec);
        return getReconciliation(id, tenantId);
    }
}
