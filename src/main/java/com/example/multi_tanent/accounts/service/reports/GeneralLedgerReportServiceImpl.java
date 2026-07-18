package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.GeneralLedgerRow;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountBalanceType;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryLineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GeneralLedgerReportServiceImpl implements GeneralLedgerReportService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Override
    public List<GeneralLedgerRow> getGeneralLedgerReport(Long tenantId, Long accountId, LocalDate fromDate, LocalDate toDate) {
        ChartOfAccount account = chartOfAccountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        if (!account.getTenant().getId().equals(tenantId)) {
            throw new SecurityException("Unauthorized access to account");
        }

        List<JournalEntryLine> lines = journalEntryLineRepository.findPostedLinesByAccountUpToDate(accountId, tenantId, toDate);

        BigDecimal openingDebitSum = BigDecimal.ZERO;
        BigDecimal openingCreditSum = BigDecimal.ZERO;

        List<GeneralLedgerRow> periodRows = new ArrayList<>();

        for (JournalEntryLine line : lines) {
            JournalEntry entry = line.getJournalEntry();
            LocalDate entryDate = entry.getEntryDate();

            BigDecimal debit = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO;

            if (entryDate.isBefore(fromDate)) {
                openingDebitSum = openingDebitSum.add(debit);
                openingCreditSum = openingCreditSum.add(credit);
            }
        }

        AccountBalanceType balanceType = account.getAccountType();
        BigDecimal runningBalance = BigDecimal.ZERO;

        if (balanceType == AccountBalanceType.CREDIT) {
            runningBalance = openingCreditSum.subtract(openingDebitSum);
        } else {
            runningBalance = openingDebitSum.subtract(openingCreditSum);
        }

        // Add an initial opening balance row
        periodRows.add(GeneralLedgerRow.builder()
                .entryDate(fromDate)
                .entryNumber("OPENING_BALANCE")
                .referenceNumber("")
                .description("Opening Balance")
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(BigDecimal.ZERO)
                .runningBalance(runningBalance)
                .build());

        for (JournalEntryLine line : lines) {
            JournalEntry entry = line.getJournalEntry();
            LocalDate entryDate = entry.getEntryDate();

            BigDecimal debit = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO;

            if (!entryDate.isBefore(fromDate)) {
                if (balanceType == AccountBalanceType.CREDIT) {
                    runningBalance = runningBalance.add(credit).subtract(debit);
                } else {
                    runningBalance = runningBalance.add(debit).subtract(credit);
                }

                periodRows.add(GeneralLedgerRow.builder()
                        .entryDate(entryDate)
                        .entryNumber(entry.getEntryNumber())
                        .referenceNumber(entry.getReferenceNumber() != null ? entry.getReferenceNumber() : "")
                        .description(line.getDescription() != null ? line.getDescription() : entry.getDescription())
                        .debitAmount(debit)
                        .creditAmount(credit)
                        .runningBalance(runningBalance)
                        .build());
            }
        }

        return periodRows;
    }
}
