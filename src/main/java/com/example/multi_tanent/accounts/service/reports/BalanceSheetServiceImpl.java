package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.BalanceSheetResponse;
import com.example.multi_tanent.accounts.dto.reports.BalanceSheetSection;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryLineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BalanceSheetServiceImpl implements BalanceSheetService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Override
    public BalanceSheetResponse getBalanceSheet(Long tenantId, LocalDate toDate) {
        List<ChartOfAccount> accounts = chartOfAccountRepository.findAllByTenant(tenantId);
        List<Object[]> linesWithEntries = journalEntryLineRepository.findPostedLinesUpToDate(tenantId, toDate);

        // Group lines by account ID
        Map<Long, List<Object[]>> linesByAccount = linesWithEntries.stream()
                .collect(Collectors.groupingBy(arr -> ((JournalEntryLine) arr[0]).getAccount().getAccountId()));

        List<BalanceSheetSection.AccountBalanceRow> assetAccounts = new ArrayList<>();
        List<BalanceSheetSection.AccountBalanceRow> liabilityAccounts = new ArrayList<>();
        List<BalanceSheetSection.AccountBalanceRow> equityAccounts = new ArrayList<>();

        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquity = BigDecimal.ZERO;
        BigDecimal netIncome = BigDecimal.ZERO;

        for (ChartOfAccount account : accounts) {
            AccountSection section = account.getSection();
            if (section == AccountSection.ACCOUNTS_GROUP) {
                continue;
            }

            BigDecimal debitSum = BigDecimal.ZERO;
            BigDecimal creditSum = BigDecimal.ZERO;

            List<Object[]> accountLines = linesByAccount.getOrDefault(account.getAccountId(), Collections.emptyList());
            for (Object[] arr : accountLines) {
                JournalEntryLine line = (JournalEntryLine) arr[0];
                BigDecimal lineDebit = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
                BigDecimal lineCredit = line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO;
                debitSum = debitSum.add(lineDebit);
                creditSum = creditSum.add(lineCredit);
            }

            if (isAssetSection(section)) {
                // Assets: debit - credit
                BigDecimal balance = debitSum.subtract(creditSum);
                totalAssets = totalAssets.add(balance);
                assetAccounts.add(BalanceSheetSection.AccountBalanceRow.builder()
                        .accountCode(account.getAccountCode())
                        .description(account.getDescription())
                        .balance(balance)
                        .build());
            } else if (isLiabilitySection(section)) {
                // Liabilities: credit - debit
                BigDecimal balance = creditSum.subtract(debitSum);
                totalLiabilities = totalLiabilities.add(balance);
                liabilityAccounts.add(BalanceSheetSection.AccountBalanceRow.builder()
                        .accountCode(account.getAccountCode())
                        .description(account.getDescription())
                        .balance(balance)
                        .build());
            } else if (isEquitySection(section)) {
                // Equity: credit - debit
                BigDecimal balance = creditSum.subtract(debitSum);
                totalEquity = totalEquity.add(balance);
                equityAccounts.add(BalanceSheetSection.AccountBalanceRow.builder()
                        .accountCode(account.getAccountCode())
                        .description(account.getDescription())
                        .balance(balance)
                        .build());
            } else if (isPLSection(section)) {
                // P&L: credit - debit
                BigDecimal balance = creditSum.subtract(debitSum);
                netIncome = netIncome.add(balance);
            }
        }

        // Add Net Income to Equity accounts list and total
        if (netIncome.compareTo(BigDecimal.ZERO) != 0) {
            equityAccounts.add(BalanceSheetSection.AccountBalanceRow.builder()
                    .accountCode("NET_INCOME")
                    .description("Net Income (Current Period)")
                    .balance(netIncome)
                    .build());
            totalEquity = totalEquity.add(netIncome);
        }

        BalanceSheetSection assetsSection = BalanceSheetSection.builder()
                .sectionName("ASSETS")
                .accounts(assetAccounts)
                .totalAmount(totalAssets)
                .build();

        BalanceSheetSection liabilitiesSection = BalanceSheetSection.builder()
                .sectionName("LIABILITIES")
                .accounts(liabilityAccounts)
                .totalAmount(totalLiabilities)
                .build();

        BalanceSheetSection equitySection = BalanceSheetSection.builder()
                .sectionName("EQUITY")
                .accounts(equityAccounts)
                .totalAmount(totalEquity)
                .build();

        return BalanceSheetResponse.builder()
                .sections(List.of(assetsSection, liabilitiesSection, equitySection))
                .totalAssets(totalAssets)
                .totalLiabilitiesAndEquity(totalLiabilities.add(totalEquity))
                .build();
    }

    private boolean isAssetSection(AccountSection section) {
        return section == AccountSection.BS_CASH ||
               section == AccountSection.BS_CASH_EQUIVALENTS ||
               section == AccountSection.BS_CURRENT_FINANCIAL_ASSETS ||
               section == AccountSection.BS_INVENTORIES ||
               section == AccountSection.BS_TRADE_RECEIVABLES ||
               section == AccountSection.BS_INPUT_VAT ||
               section == AccountSection.BS_PREPAYMENTS_TO_SUPPLIERS ||
               section == AccountSection.BS_PDC_RECEIVED ||
               section == AccountSection.BS_DEFERRED_EXPENSES ||
               section == AccountSection.BS_CONTRACT_ASSETS ||
               section == AccountSection.BS_FIXED_ASSETS ||
               section == AccountSection.BS_CAPITAL_IMPROVEMENTS_PPE ||
               section == AccountSection.BS_INTANGIBLE_ASSETS ||
               section == AccountSection.BS_INVESTMENT_PROPERTY ||
               section == AccountSection.BS_ACCUMULATED_DEPRECIATION ||
               section == AccountSection.BS_NON_CURRENT_FINANCIAL_ASSETS ||
               section == AccountSection.BS_NON_CURRENT_DEFERRED_EXPENSES ||
               section == AccountSection.BS_NON_CURRENT_CONTRACT_ASSETS ||
               section == AccountSection.BS_DEFERRED_TAX_ASSETS;
    }

    private boolean isLiabilitySection(AccountSection section) {
        return section == AccountSection.BS_TRADE_PAYABLES ||
               section == AccountSection.BS_ADVANCES_FROM_CUSTOMERS ||
               section == AccountSection.BS_PDC_ISSUED ||
               section == AccountSection.BS_DEFERRED_REVENUE ||
               section == AccountSection.BS_VAT_PAYABLE ||
               section == AccountSection.BS_SALARIES_PAYABLE ||
               section == AccountSection.BS_EOSB_PROVISION ||
               section == AccountSection.BS_CURRENT_FINANCIAL_LIABILITIES ||
               section == AccountSection.BS_CURRENT_INCOME_TAX_PAYABLE ||
               section == AccountSection.BS_CURRENT_OTHER_TAX_PAYABLE ||
               section == AccountSection.BS_CONTRACT_LIABILITIES ||
               section == AccountSection.BS_NON_CURRENT_FINANCIAL_LIABILITIES ||
               section == AccountSection.BS_DEFERRED_TAX_LIABILITIES ||
               section == AccountSection.BS_NON_CURRENT_DEFERRED_REVENUE ||
               section == AccountSection.BS_NON_CURRENT_CONTRACT_LIABILITIES;
    }

    private boolean isEquitySection(AccountSection section) {
        return section == AccountSection.BS_SHARE_CAPITAL ||
               section == AccountSection.BS_RETAINED_EARNINGS ||
               section == AccountSection.BS_EQUITY ||
               section == AccountSection.BS_NON_CONTROLLING_INTEREST;
    }

    private boolean isPLSection(AccountSection section) {
        return section.name().startsWith("PL_");
    }
}
