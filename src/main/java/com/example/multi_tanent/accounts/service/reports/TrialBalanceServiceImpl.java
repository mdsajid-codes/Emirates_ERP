package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.TrialBalanceRow;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrialBalanceServiceImpl implements TrialBalanceService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Override
    public List<TrialBalanceRow> getTrialBalance(Long tenantId, LocalDate fromDate, LocalDate toDate) {
        List<ChartOfAccount> accounts = chartOfAccountRepository.findAllByTenant(tenantId);
        List<Object[]> linesWithEntries = journalEntryLineRepository.findPostedLinesUpToDate(tenantId, toDate);

        Map<Long, List<Object[]>> linesByAccount = linesWithEntries.stream()
                .collect(Collectors.groupingBy(arr -> ((JournalEntryLine) arr[0]).getAccount().getAccountId()));

        Map<Long, TrialBalanceRow> rowMap = new LinkedHashMap<>();

        for (ChartOfAccount account : accounts) {
            TrialBalanceRow row = TrialBalanceRow.builder()
                    .accountId(account.getAccountId())
                    .accountCode(account.getAccountCode())
                    .description(account.getDescription())
                    .level(account.getLevel() != null ? account.getLevel() : 1)
                    .isGroup(account.getSection() == com.example.multi_tanent.accounts.entity.enums.AccountSection.ACCOUNTS_GROUP)
                    .openingDebit(BigDecimal.ZERO)
                    .openingCredit(BigDecimal.ZERO)
                    .debitTurnover(BigDecimal.ZERO)
                    .creditTurnover(BigDecimal.ZERO)
                    .closingDebit(BigDecimal.ZERO)
                    .closingCredit(BigDecimal.ZERO)
                    .children(new ArrayList<>())
                    .build();

            if (!row.getIsGroup()) {
                BigDecimal openingDebitSum = BigDecimal.ZERO;
                BigDecimal openingCreditSum = BigDecimal.ZERO;
                BigDecimal debitTurnover = BigDecimal.ZERO;
                BigDecimal creditTurnover = BigDecimal.ZERO;

                List<Object[]> accountLines = linesByAccount.getOrDefault(account.getAccountId(), Collections.emptyList());
                for (Object[] arr : accountLines) {
                    JournalEntryLine line = (JournalEntryLine) arr[0];
                    JournalEntry entry = (JournalEntry) arr[1];
                    LocalDate entryDate = entry.getEntryDate();

                    BigDecimal lineDebit = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
                    BigDecimal lineCredit = line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO;

                    if (entryDate.isBefore(fromDate)) {
                        openingDebitSum = openingDebitSum.add(lineDebit);
                        openingCreditSum = openingCreditSum.add(lineCredit);
                    } else {
                        debitTurnover = debitTurnover.add(lineDebit);
                        creditTurnover = creditTurnover.add(lineCredit);
                    }
                }

                AccountBalanceType balanceType = account.getAccountType();

                if (balanceType == AccountBalanceType.CREDIT) {
                    BigDecimal netOpening = openingCreditSum.subtract(openingDebitSum);
                    if (netOpening.compareTo(BigDecimal.ZERO) >= 0) {
                        row.setOpeningCredit(netOpening);
                    } else {
                        row.setOpeningDebit(netOpening.negate());
                    }
                } else {
                    BigDecimal netOpening = openingDebitSum.subtract(openingCreditSum);
                    if (netOpening.compareTo(BigDecimal.ZERO) >= 0) {
                        row.setOpeningDebit(netOpening);
                    } else {
                        row.setOpeningCredit(netOpening.negate());
                    }
                }

                if (balanceType == AccountBalanceType.CREDIT) {
                    BigDecimal netClosing = openingCreditSum.subtract(openingDebitSum)
                            .add(creditTurnover).subtract(debitTurnover);
                    if (netClosing.compareTo(BigDecimal.ZERO) >= 0) {
                        row.setClosingCredit(netClosing);
                    } else {
                        row.setClosingDebit(netClosing.negate());
                    }
                } else {
                    BigDecimal netClosing = openingDebitSum.subtract(openingCreditSum)
                            .add(debitTurnover).subtract(creditTurnover);
                    if (netClosing.compareTo(BigDecimal.ZERO) >= 0) {
                        row.setClosingDebit(netClosing);
                    } else {
                        row.setClosingCredit(netClosing.negate());
                    }
                }
                
                row.setDebitTurnover(debitTurnover);
                row.setCreditTurnover(creditTurnover);
            }
            rowMap.put(account.getAccountId(), row);
        }

        List<TrialBalanceRow> rootNodes = new ArrayList<>();
        
        for (ChartOfAccount account : accounts) {
            TrialBalanceRow row = rowMap.get(account.getAccountId());
            if (account.getParent() != null) {
                TrialBalanceRow parentRow = rowMap.get(account.getParent().getAccountId());
                if (parentRow != null) {
                    parentRow.getChildren().add(row);
                }
            } else {
                rootNodes.add(row);
            }
        }
        
        accounts.sort((a, b) -> Integer.compare(b.getLevel() != null ? b.getLevel() : 1, a.getLevel() != null ? a.getLevel() : 1));
        
        for (ChartOfAccount account : accounts) {
            TrialBalanceRow row = rowMap.get(account.getAccountId());
            if (row.getIsGroup()) {
                BigDecimal openingDebit = BigDecimal.ZERO;
                BigDecimal openingCredit = BigDecimal.ZERO;
                BigDecimal debitTurnover = BigDecimal.ZERO;
                BigDecimal creditTurnover = BigDecimal.ZERO;
                BigDecimal closingDebit = BigDecimal.ZERO;
                BigDecimal closingCredit = BigDecimal.ZERO;
                
                for (TrialBalanceRow child : row.getChildren()) {
                    openingDebit = openingDebit.add(child.getOpeningDebit() != null ? child.getOpeningDebit() : BigDecimal.ZERO);
                    openingCredit = openingCredit.add(child.getOpeningCredit() != null ? child.getOpeningCredit() : BigDecimal.ZERO);
                    debitTurnover = debitTurnover.add(child.getDebitTurnover() != null ? child.getDebitTurnover() : BigDecimal.ZERO);
                    creditTurnover = creditTurnover.add(child.getCreditTurnover() != null ? child.getCreditTurnover() : BigDecimal.ZERO);
                    closingDebit = closingDebit.add(child.getClosingDebit() != null ? child.getClosingDebit() : BigDecimal.ZERO);
                    closingCredit = closingCredit.add(child.getClosingCredit() != null ? child.getClosingCredit() : BigDecimal.ZERO);
                }
                
                row.setOpeningDebit(openingDebit);
                row.setOpeningCredit(openingCredit);
                row.setDebitTurnover(debitTurnover);
                row.setCreditTurnover(creditTurnover);
                row.setClosingDebit(closingDebit);
                row.setClosingCredit(closingCredit);
            }
        }

        if (rootNodes.isEmpty() && !accounts.isEmpty()) {
            Map<String, List<ChartOfAccount>> grouped = accounts.stream()
                    .collect(Collectors.groupingBy(c -> c.getParentGroup() != null ? c.getParentGroup() : "Uncategorized"));

            for (var entry : grouped.entrySet()) {
                TrialBalanceRow groupRow = TrialBalanceRow.builder()
                        .accountId(null)
                        .accountCode("")
                        .description(entry.getKey())
                        .level(1)
                        .isGroup(true)
                        .children(new ArrayList<>())
                        .openingDebit(BigDecimal.ZERO)
                        .openingCredit(BigDecimal.ZERO)
                        .debitTurnover(BigDecimal.ZERO)
                        .creditTurnover(BigDecimal.ZERO)
                        .closingDebit(BigDecimal.ZERO)
                        .closingCredit(BigDecimal.ZERO)
                        .build();

                for (ChartOfAccount c : entry.getValue()) {
                    TrialBalanceRow child = rowMap.get(c.getAccountId());
                    groupRow.getChildren().add(child);
                    
                    groupRow.setOpeningDebit(groupRow.getOpeningDebit().add(child.getOpeningDebit() != null ? child.getOpeningDebit() : BigDecimal.ZERO));
                    groupRow.setOpeningCredit(groupRow.getOpeningCredit().add(child.getOpeningCredit() != null ? child.getOpeningCredit() : BigDecimal.ZERO));
                    groupRow.setDebitTurnover(groupRow.getDebitTurnover().add(child.getDebitTurnover() != null ? child.getDebitTurnover() : BigDecimal.ZERO));
                    groupRow.setCreditTurnover(groupRow.getCreditTurnover().add(child.getCreditTurnover() != null ? child.getCreditTurnover() : BigDecimal.ZERO));
                    groupRow.setClosingDebit(groupRow.getClosingDebit().add(child.getClosingDebit() != null ? child.getClosingDebit() : BigDecimal.ZERO));
                    groupRow.setClosingCredit(groupRow.getClosingCredit().add(child.getClosingCredit() != null ? child.getClosingCredit() : BigDecimal.ZERO));
                }
                rootNodes.add(groupRow);
            }
        }

        return rootNodes;
    }
}
