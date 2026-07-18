package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.IncomeStatementResponse;
import com.example.multi_tanent.accounts.dto.reports.IncomeStatementSection;
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
public class IncomeStatementServiceImpl implements IncomeStatementService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Override
    public IncomeStatementResponse getIncomeStatement(Long tenantId, LocalDate fromDate, LocalDate toDate) {
        List<ChartOfAccount> accounts = chartOfAccountRepository.findAllByTenant(tenantId);
        List<Object[]> linesWithEntries = journalEntryLineRepository.findPostedLinesUpToDate(tenantId, toDate);

        // Group lines by account ID
        Map<Long, List<Object[]>> linesByAccount = linesWithEntries.stream()
                .collect(Collectors.groupingBy(arr -> ((JournalEntryLine) arr[0]).getAccount().getAccountId()));

        List<IncomeStatementSection.AccountBalanceRow> revenueAccounts = new ArrayList<>();
        List<IncomeStatementSection.AccountBalanceRow> cogsAccounts = new ArrayList<>();
        List<IncomeStatementSection.AccountBalanceRow> expenseAccounts = new ArrayList<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCogs = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (ChartOfAccount account : accounts) {
            AccountSection section = account.getSection();
            if (section == AccountSection.ACCOUNTS_GROUP) {
                continue;
            }

            // Determine if the account belongs to Revenue, COGS, or Expenses
            boolean isRevenue = isRevenueSection(section);
            boolean isCogs = isCogsSection(section);
            boolean isExpense = isExpenseSection(section);

            if (!isRevenue && !isCogs && !isExpense) {
                continue;
            }

            BigDecimal debitSum = BigDecimal.ZERO;
            BigDecimal creditSum = BigDecimal.ZERO;

            List<Object[]> accountLines = linesByAccount.getOrDefault(account.getAccountId(), Collections.emptyList());
            for (Object[] arr : accountLines) {
                JournalEntryLine line = (JournalEntryLine) arr[0];
                JournalEntry entry = (JournalEntry) arr[1];
                LocalDate entryDate = entry.getEntryDate();

                // Only include in-period transactions
                if (!entryDate.isBefore(fromDate)) {
                    BigDecimal lineDebit = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
                    BigDecimal lineCredit = line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO;
                    debitSum = debitSum.add(lineDebit);
                    creditSum = creditSum.add(lineCredit);
                }
            }

            BigDecimal balance = BigDecimal.ZERO;
            if (isRevenue) {
                // Revenue is credit-type, so credit - debit.
                balance = creditSum.subtract(debitSum);
                totalRevenue = totalRevenue.add(balance);
                revenueAccounts.add(IncomeStatementSection.AccountBalanceRow.builder()
                        .accountCode(account.getAccountCode())
                        .description(account.getDescription())
                        .balance(balance)
                        .build());
            } else if (isCogs) {
                // COGS is debit-type, so debit - credit.
                balance = debitSum.subtract(creditSum);
                totalCogs = totalCogs.add(balance);
                cogsAccounts.add(IncomeStatementSection.AccountBalanceRow.builder()
                        .accountCode(account.getAccountCode())
                        .description(account.getDescription())
                        .balance(balance)
                        .build());
            } else {
                // Expense is debit-type, so debit - credit.
                balance = debitSum.subtract(creditSum);
                totalExpenses = totalExpenses.add(balance);
                expenseAccounts.add(IncomeStatementSection.AccountBalanceRow.builder()
                        .accountCode(account.getAccountCode())
                        .description(account.getDescription())
                        .balance(balance)
                        .build());
            }
        }

        IncomeStatementSection revenueSection = IncomeStatementSection.builder()
                .sectionName("REVENUE")
                .accounts(revenueAccounts)
                .totalAmount(totalRevenue)
                .build();

        IncomeStatementSection cogsSection = IncomeStatementSection.builder()
                .sectionName("COGS")
                .accounts(cogsAccounts)
                .totalAmount(totalCogs)
                .build();

        IncomeStatementSection expenseSection = IncomeStatementSection.builder()
                .sectionName("EXPENSES")
                .accounts(expenseAccounts)
                .totalAmount(totalExpenses)
                .build();

        BigDecimal grossProfit = totalRevenue.subtract(totalCogs);
        BigDecimal netProfit = grossProfit.subtract(totalExpenses);

        return IncomeStatementResponse.builder()
                .sections(List.of(revenueSection, cogsSection, expenseSection))
                .grossProfit(grossProfit)
                .netProfit(netProfit)
                .build();
    }

    private boolean isRevenueSection(AccountSection section) {
        return section == AccountSection.PL_SALES_GOODS ||
               section == AccountSection.PL_SALES_SERVICES ||
               section == AccountSection.PL_OTHER_INCOME ||
               section == AccountSection.PL_INTEREST_INCOME ||
               section == AccountSection.PL_TRADE_DISCOUNTS;
    }

    private boolean isCogsSection(AccountSection section) {
        return section == AccountSection.PL_COS_GOODS ||
               section == AccountSection.PL_COS_PRODUCTION;
    }

    private boolean isExpenseSection(AccountSection section) {
        return section == AccountSection.PL_ADMIN_EXPENSES ||
               section == AccountSection.PL_OPERATING_EXPENSES ||
               section == AccountSection.PL_DEPRECIATION ||
               section == AccountSection.PL_SALARIES ||
               section == AccountSection.PL_EOSB ||
               section == AccountSection.PL_FUEL_TRANSPORT ||
               section == AccountSection.PL_PRODUCTION_OVERHEADS ||
               section == AccountSection.PL_INTEREST_EXPENSE ||
               section == AccountSection.PL_INCOME_TAX;
    }
}
