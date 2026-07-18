package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.ReconciliationStatusRow;
import com.example.multi_tanent.accounts.dto.subledger.UntaggedLineRow;
import com.example.multi_tanent.accounts.entity.EmployeeGLAccount;
import com.example.multi_tanent.accounts.entity.PartyGLAccount;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.repository.BankGLAccountRepository;
import com.example.multi_tanent.accounts.repository.EmployeeGLAccountRepository;
import com.example.multi_tanent.accounts.repository.FixedAssetGLAccountRepository;
import com.example.multi_tanent.accounts.repository.ItemGLAccountRepository;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.SubLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReconciliationDashboardServiceImpl implements ReconciliationDashboardService {

    private final SubLedgerRepository subLedgerRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final EmployeeGLAccountRepository employeeGLAccountRepository;
    private final BankGLAccountRepository bankGLAccountRepository;
    private final ItemGLAccountRepository itemGLAccountRepository;
    private final FixedAssetGLAccountRepository fixedAssetGLAccountRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;

    @Override
    public List<ReconciliationStatusRow> getReconciliationSummary(Long tenantId) {
        List<ReconciliationStatusRow> rows = new ArrayList<>();

        // 1. Accounts Receivable
        List<PartyGLAccount> arAccounts = partyGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(p -> p.getPartyType() == PartyType.CUSTOMER && p.getAccountsReceivable() != null)
                .collect(Collectors.toList());
        List<Long> arAccountIds = arAccounts.stream().map(a -> a.getAccountsReceivable().getAccountId()).distinct().collect(Collectors.toList());
        rows.add(buildRow("ar", "Accounts Receivable", arAccountIds, tenantId, "/account-dashboard/sub-ledger/ar"));

        // 2. Accounts Payable
        List<PartyGLAccount> apAccounts = partyGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(p -> p.getPartyType() == PartyType.SUPPLIER && p.getAccountsPayable() != null)
                .collect(Collectors.toList());
        List<Long> apAccountIds = apAccounts.stream().map(a -> a.getAccountsPayable().getAccountId()).distinct().collect(Collectors.toList());
        rows.add(buildRow("ap", "Accounts Payable", apAccountIds, tenantId, "/account-dashboard/sub-ledger/ap"));

        // 3. Employee
        List<EmployeeGLAccount> empAccounts = employeeGLAccountRepository.findAllByTenant(tenantId);
        List<Long> empAccountIds = new ArrayList<>();
        for (EmployeeGLAccount acc : empAccounts) {
            if (acc.getSalaryPayableAccount() != null) empAccountIds.add(acc.getSalaryPayableAccount().getAccountId());
            if (acc.getAdvanceAccount() != null) empAccountIds.add(acc.getAdvanceAccount().getAccountId());
            if (acc.getExpenseAccount() != null) empAccountIds.add(acc.getExpenseAccount().getAccountId());
        }
        empAccountIds = empAccountIds.stream().distinct().collect(Collectors.toList());
        rows.add(buildRow("employee", "Employee Ledger", empAccountIds, tenantId, "/account-dashboard/sub-ledger/employee"));

        // 4. Bank / Cash
        List<Long> bankAccountIds = bankGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(b -> b.getGlAccount() != null)
                .map(b -> b.getGlAccount().getAccountId()).distinct().collect(Collectors.toList());
        rows.add(buildRow("bank", "Bank / Cash", bankAccountIds, tenantId, "/account-dashboard/sub-ledger/bank"));

        // 5. Inventory
        List<Long> itemAccountIds = itemGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(i -> i.getGlAccount() != null)
                .map(i -> i.getGlAccount().getAccountId()).distinct().collect(Collectors.toList());
        rows.add(buildRow("inventory", "Inventory", itemAccountIds, tenantId, "/account-dashboard/sub-ledger/inventory"));

        // 6. Fixed Assets
        List<Long> assetAccountIds = new ArrayList<>();
        fixedAssetGLAccountRepository.findAllByTenant(tenantId).forEach(f -> {
            if (f.getAssetCostAccount() != null) assetAccountIds.add(f.getAssetCostAccount().getAccountId());
            if (f.getAccumDepreciationAccount() != null) assetAccountIds.add(f.getAccumDepreciationAccount().getAccountId());
        });
        List<Long> distinctAssetAccountIds = assetAccountIds.stream().distinct().collect(Collectors.toList());
        rows.add(buildRow("fixed-assets", "Fixed Assets", distinctAssetAccountIds, tenantId, "/account-dashboard/sub-ledger/fixed-assets"));

        return rows;
    }

    private ReconciliationStatusRow buildRow(String key, String name, List<Long> accountIds, Long tenantId, String url) {
        if (accountIds == null || accountIds.isEmpty()) {
            return ReconciliationStatusRow.builder()
                    .subLedgerKey(key).subLedgerName(name).controlAccountCodes(Collections.emptyList())
                    .glBalance(BigDecimal.ZERO).subLedgerTotal(BigDecimal.ZERO)
                    .difference(BigDecimal.ZERO).isBalanced(true).untaggedLineCount(0).drillDownUrl(url)
                    .build();
        }

        List<String> accountCodes = chartOfAccountRepository.findAllById(accountIds).stream()
                .map(ChartOfAccount::getAccountCode)
                .collect(Collectors.toList());

        BigDecimal glBalance = subLedgerRepository.getGLAccountBalance(tenantId, accountIds);
        if (glBalance == null) glBalance = BigDecimal.ZERO;

        BigDecimal subLedgerTotal = calculateSubLedgerTotal(key, tenantId, accountIds);
        BigDecimal difference = glBalance.subtract(subLedgerTotal);
        
        int untaggedCount = getUntaggedLines(key, tenantId, accountIds).size();

        return ReconciliationStatusRow.builder()
                .subLedgerKey(key)
                .subLedgerName(name)
                .controlAccountCodes(accountCodes)
                .glBalance(glBalance)
                .subLedgerTotal(subLedgerTotal)
                .difference(difference)
                .isBalanced(difference.compareTo(BigDecimal.ZERO) == 0)
                .untaggedLineCount(untaggedCount)
                .drillDownUrl(url)
                .build();
    }

    private BigDecimal calculateSubLedgerTotal(String key, Long tenantId, List<Long> accountIds) {
        BigDecimal total = BigDecimal.ZERO;
        List<Object[]> balances;
        switch (key) {
            case "ar":
            case "ap":
                balances = subLedgerRepository.getPartyBalances(tenantId, accountIds);
                for (Object[] row : balances) {
                    if (row[3] != null) total = total.add((BigDecimal) row[3]);
                }
                break;
            case "employee":
                balances = subLedgerRepository.getEmployeeBalances(tenantId, accountIds);
                for (Object[] row : balances) {
                    if (row[3] != null) total = total.add((BigDecimal) row[3]);
                }
                break;
            case "bank":
                balances = subLedgerRepository.getBankBalances(tenantId, accountIds);
                for (Object[] row : balances) {
                    if (row[3] != null) total = total.add((BigDecimal) row[3]);
                }
                break;
            case "inventory":
                balances = subLedgerRepository.getInventoryItemBalances(tenantId, accountIds);
                for (Object[] row : balances) {
                    BigDecimal debit = row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO;
                    BigDecimal credit = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;
                    total = total.add(debit.subtract(credit));
                }
                break;
            case "fixed-assets":
                balances = subLedgerRepository.getAssetBalances(tenantId, accountIds);
                for (Object[] row : balances) {
                    BigDecimal debit = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
                    BigDecimal credit = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
                    total = total.add(debit.subtract(credit));
                }
                break;
        }
        return total;
    }

    @Override
    public List<UntaggedLineRow> getUntaggedLines(String subLedgerKey, Long tenantId) {
        List<Long> accountIds = getAccountIdsForKey(subLedgerKey, tenantId);
        if (accountIds.isEmpty()) return Collections.emptyList();
        
        return getUntaggedLines(subLedgerKey, tenantId, accountIds).stream()
                .map(this::mapToUntaggedLineRow)
                .collect(Collectors.toList());
    }

    private List<Object[]> getUntaggedLines(String subLedgerKey, Long tenantId, List<Long> accountIds) {
        switch (subLedgerKey) {
            case "ar":
            case "ap":
                return subLedgerRepository.getUntaggedPartyLines(tenantId, accountIds);
            case "employee":
                return subLedgerRepository.getUntaggedEmployeeLines(tenantId, accountIds);
            case "bank":
                return subLedgerRepository.getUntaggedBankLines(tenantId, accountIds);
            case "inventory":
            case "fixed-assets":
                return subLedgerRepository.getUntaggedItemLines(tenantId, accountIds);
            default:
                return Collections.emptyList();
        }
    }

    private List<Long> getAccountIdsForKey(String key, Long tenantId) {
        switch (key) {
            case "ar":
                return partyGLAccountRepository.findAllByTenant(tenantId).stream()
                        .filter(p -> p.getPartyType() == PartyType.CUSTOMER && p.getAccountsReceivable() != null)
                        .map(a -> a.getAccountsReceivable().getAccountId()).distinct().collect(Collectors.toList());
            case "ap":
                return partyGLAccountRepository.findAllByTenant(tenantId).stream()
                        .filter(p -> p.getPartyType() == PartyType.SUPPLIER && p.getAccountsPayable() != null)
                        .map(a -> a.getAccountsPayable().getAccountId()).distinct().collect(Collectors.toList());
            case "employee":
                List<Long> empAccountIds = new ArrayList<>();
                employeeGLAccountRepository.findAllByTenant(tenantId).forEach(acc -> {
                    if (acc.getSalaryPayableAccount() != null) empAccountIds.add(acc.getSalaryPayableAccount().getAccountId());
                    if (acc.getAdvanceAccount() != null) empAccountIds.add(acc.getAdvanceAccount().getAccountId());
                    if (acc.getExpenseAccount() != null) empAccountIds.add(acc.getExpenseAccount().getAccountId());
                });
                return empAccountIds.stream().distinct().collect(Collectors.toList());
            case "bank":
                return bankGLAccountRepository.findAllByTenant(tenantId).stream()
                        .filter(b -> b.getGlAccount() != null)
                        .map(b -> b.getGlAccount().getAccountId()).distinct().collect(Collectors.toList());
            case "inventory":
                return itemGLAccountRepository.findAllByTenant(tenantId).stream()
                        .filter(i -> i.getGlAccount() != null)
                        .map(i -> i.getGlAccount().getAccountId()).distinct().collect(Collectors.toList());
            case "fixed-assets":
                List<Long> assetAccountIds = new ArrayList<>();
                fixedAssetGLAccountRepository.findAllByTenant(tenantId).forEach(f -> {
                    if (f.getAssetCostAccount() != null) assetAccountIds.add(f.getAssetCostAccount().getAccountId());
                    if (f.getAccumDepreciationAccount() != null) assetAccountIds.add(f.getAccumDepreciationAccount().getAccountId());
                });
                return assetAccountIds.stream().distinct().collect(Collectors.toList());
            default:
                return Collections.emptyList();
        }
    }

    private UntaggedLineRow mapToUntaggedLineRow(Object[] row) {
        JournalEntryLine jel = (JournalEntryLine) row[0];
        JournalEntry je = (JournalEntry) row[1];
        
        return UntaggedLineRow.builder()
                .journalEntryId(je.getJournalEntryId())
                .entryNumber(je.getEntryNumber())
                .entryDate(je.getEntryDate())
                .documentType(je.getDocumentType() != null ? je.getDocumentType().name() : null)
                .accountCode(jel.getAccount() != null ? jel.getAccount().getAccountCode() : null)
                .accountDescription(jel.getAccount() != null ? jel.getAccount().getDescription() : null)
                .debitAmount(jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO)
                .creditAmount(jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO)
                .description(jel.getDescription())
                .referenceNumber(je.getReferenceNumber())
                .build();
    }
}
