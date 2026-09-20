package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.AgingReportRow;
import com.example.multi_tanent.accounts.dto.subledger.PartyStatementRow;
import com.example.multi_tanent.accounts.dto.subledger.PartySubLedgerResponse;
import com.example.multi_tanent.accounts.entity.PartyGLAccount;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.repository.EmployeeGLAccountRepository;
import com.example.multi_tanent.accounts.repository.BankGLAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.SubLedgerRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.repository.BaseCustomerRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.payroll.repository.CompanyBankAccountRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.CompanyBankAccount;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubLedgerServiceImpl implements SubLedgerService {

    private final SubLedgerRepository subLedgerRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final BaseCustomerRepository baseCustomerRepository;
    private final EmployeeGLAccountRepository employeeGLAccountRepository;
    private final BankGLAccountRepository bankGLAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyBankAccountRepository companyBankAccountRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;

    private List<Long> getArAccountIds(Long tenantId) {
        List<Long> ids = partyGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(p -> p.getPartyType() == PartyType.CUSTOMER && p.getAccountsReceivable() != null)
                .map(p -> p.getAccountsReceivable().getAccountId())
                .distinct()
                .collect(Collectors.toList());

        List<com.example.multi_tanent.accounts.entity.coa.ChartOfAccount> coaAccounts = 
                chartOfAccountRepository.findBySectionAndTenant(com.example.multi_tanent.accounts.entity.enums.AccountSection.BS_TRADE_RECEIVABLES, tenantId);
        for (com.example.multi_tanent.accounts.entity.coa.ChartOfAccount coa : coaAccounts) {
            if (coa.getAccountId() != null && !ids.contains(coa.getAccountId())) {
                ids.add(coa.getAccountId());
            }
        }
        return ids;
    }

    private List<Long> getApAccountIds(Long tenantId) {
        List<Long> ids = partyGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(p -> p.getPartyType() == PartyType.SUPPLIER && p.getAccountsPayable() != null)
                .map(p -> p.getAccountsPayable().getAccountId())
                .distinct()
                .collect(Collectors.toList());

        List<com.example.multi_tanent.accounts.entity.coa.ChartOfAccount> coaAccounts = 
                chartOfAccountRepository.findBySectionAndTenant(com.example.multi_tanent.accounts.entity.enums.AccountSection.BS_TRADE_PAYABLES, tenantId);
        for (com.example.multi_tanent.accounts.entity.coa.ChartOfAccount coa : coaAccounts) {
            if (coa.getAccountId() != null && !ids.contains(coa.getAccountId())) {
                ids.add(coa.getAccountId());
            }
        }
        return ids;
    }

    private String getPartyName(Long partyId, Long tenantId) {
        if (partyId == null)
            return "Unknown";
        return baseCustomerRepository.findById(partyId)
                .map(c -> {
                    if (c.getCompanyName() != null && !c.getCompanyName().isBlank()) return c.getCompanyName();
                    if (c.getPrimaryContactPersonFull() != null && !c.getPrimaryContactPersonFull().isBlank()) return c.getPrimaryContactPersonFull();
                    return "Customer #" + partyId;
                })
                .orElse("Customer #" + partyId);
    }

    private String getPartyCode(Long partyId, Long tenantId) {
        if (partyId == null)
            return "UNK";
        return baseCustomerRepository.findById(partyId)
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .map(c -> {
                    if (c.getVendorCustomerCode() != null && !c.getVendorCustomerCode().isBlank())
                        return c.getVendorCustomerCode();
                    if (c.getCustomerCode() != null && !c.getCustomerCode().isBlank())
                        return c.getCustomerCode();
                    return "ID-" + partyId;
                })
                .orElse("UNK-" + partyId);
    }

    private List<PartySubLedgerResponse> calculateArAging(Long tenantId, LocalDate asOfDate) {
        List<Long> arAccountIds = getArAccountIds(tenantId);
        if (arAccountIds.isEmpty())
            return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getLinesWithDueDate(tenantId, arAccountIds);

        Map<Long, List<Object[]>> partyLines = new HashMap<>();
        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            Long partyId = jel.getDimCompanyId();
            if (partyId != null) {
                partyLines.computeIfAbsent(partyId, k -> new ArrayList<>()).add(row);
            }
        }

        List<PartySubLedgerResponse> summaries = new ArrayList<>();

        for (Map.Entry<Long, List<Object[]>> entry : partyLines.entrySet()) {
            Long partyId = entry.getKey();
            List<Object[]> lines = entry.getValue();

            BigDecimal totalDebit = BigDecimal.ZERO;
            BigDecimal totalCredit = BigDecimal.ZERO;

            Map<Long, JournalEntry> invoices = new HashMap<>();
            Map<Long, BigDecimal> invoiceAmounts = new HashMap<>();
            Map<Long, BigDecimal> linkedPayments = new HashMap<>();
            BigDecimal unlinkedCredits = BigDecimal.ZERO;

            for (Object[] row : lines) {
                JournalEntryLine jel = (JournalEntryLine) row[0];
                JournalEntry je = (JournalEntry) row[1];

                BigDecimal debit = jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO;
                BigDecimal credit = jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO;

                totalDebit = totalDebit.add(debit);
                totalCredit = totalCredit.add(credit);

                BigDecimal netDr = debit.subtract(credit);

                if (je.getLinkedInvoice() != null) {
                    Long linkedInvoiceJeId = je.getLinkedInvoice().getJournalEntryId();
                    BigDecimal currentPayment = credit.subtract(debit);
                    linkedPayments.put(linkedInvoiceJeId,
                            linkedPayments.getOrDefault(linkedInvoiceJeId, BigDecimal.ZERO).add(currentPayment));
                } else {
                    if (netDr.compareTo(BigDecimal.ZERO) > 0) {
                        invoices.put(je.getJournalEntryId(), je);
                        invoiceAmounts.put(je.getJournalEntryId(),
                                invoiceAmounts.getOrDefault(je.getJournalEntryId(), BigDecimal.ZERO).add(netDr));
                    } else if (netDr.compareTo(BigDecimal.ZERO) < 0) {
                        unlinkedCredits = unlinkedCredits.add(netDr.negate());
                    }
                }
            }

            BigDecimal balance = totalDebit.subtract(totalCredit);

            BigDecimal agingCurrent = BigDecimal.ZERO;
            BigDecimal aging30 = BigDecimal.ZERO;
            BigDecimal aging60 = BigDecimal.ZERO;
            BigDecimal aging90 = BigDecimal.ZERO;
            BigDecimal agingOver90 = BigDecimal.ZERO;

            for (Map.Entry<Long, JournalEntry> invEntry : invoices.entrySet()) {
                Long invId = invEntry.getKey();
                JournalEntry invJe = invEntry.getValue();
                BigDecimal invTotal = invoiceAmounts.get(invId);
                BigDecimal invPayments = linkedPayments.getOrDefault(invId, BigDecimal.ZERO);

                BigDecimal remaining = invTotal.subtract(invPayments);
                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    LocalDate effectiveDate = invJe.getDueDate() != null ? invJe.getDueDate() : invJe.getEntryDate();
                    long daysOverdue = ChronoUnit.DAYS.between(effectiveDate, asOfDate);

                    if (daysOverdue <= 0) {
                        agingCurrent = agingCurrent.add(remaining);
                    } else if (daysOverdue <= 30) {
                        aging30 = aging30.add(remaining);
                    } else if (daysOverdue <= 60) {
                        aging60 = aging60.add(remaining);
                    } else if (daysOverdue <= 90) {
                        aging90 = aging90.add(remaining);
                    } else {
                        agingOver90 = agingOver90.add(remaining);
                    }
                }
            }

            if (unlinkedCredits.compareTo(BigDecimal.ZERO) > 0) {
                if (unlinkedCredits.compareTo(agingOver90) >= 0) {
                    unlinkedCredits = unlinkedCredits.subtract(agingOver90);
                    agingOver90 = BigDecimal.ZERO;
                } else {
                    agingOver90 = agingOver90.subtract(unlinkedCredits);
                    unlinkedCredits = BigDecimal.ZERO;
                }

                if (unlinkedCredits.compareTo(aging90) >= 0) {
                    unlinkedCredits = unlinkedCredits.subtract(aging90);
                    aging90 = BigDecimal.ZERO;
                } else {
                    aging90 = aging90.subtract(unlinkedCredits);
                    unlinkedCredits = BigDecimal.ZERO;
                }

                if (unlinkedCredits.compareTo(aging60) >= 0) {
                    unlinkedCredits = unlinkedCredits.subtract(aging60);
                    aging60 = BigDecimal.ZERO;
                } else {
                    aging60 = aging60.subtract(unlinkedCredits);
                    unlinkedCredits = BigDecimal.ZERO;
                }

                if (unlinkedCredits.compareTo(aging30) >= 0) {
                    unlinkedCredits = unlinkedCredits.subtract(aging30);
                    aging30 = BigDecimal.ZERO;
                } else {
                    aging30 = aging30.subtract(unlinkedCredits);
                    unlinkedCredits = BigDecimal.ZERO;
                }

                if (unlinkedCredits.compareTo(agingCurrent) >= 0) {
                    unlinkedCredits = unlinkedCredits.subtract(agingCurrent);
                    agingCurrent = BigDecimal.ZERO;
                } else {
                    agingCurrent = agingCurrent.subtract(unlinkedCredits);
                    unlinkedCredits = BigDecimal.ZERO;
                }

                if (unlinkedCredits.compareTo(BigDecimal.ZERO) > 0) {
                    agingCurrent = agingCurrent.subtract(unlinkedCredits);
                }
            }

            summaries.add(PartySubLedgerResponse.builder()
                    .partyId(partyId)
                    .partyName(getPartyName(partyId, tenantId))
                    .partyCode(getPartyCode(partyId, tenantId))
                    .totalDebit(totalDebit)
                    .totalCredit(totalCredit)
                    .balance(balance)
                    .agingCurrent(agingCurrent)
                    .aging30(aging30)
                    .aging60(aging60)
                    .aging90(aging90)
                    .agingOver90(agingOver90)
                    .build());
        }

        return summaries;
    }

    @Override
    public List<PartySubLedgerResponse> getArSummary(Long tenantId) {
        return calculateArAging(tenantId, LocalDate.now());
    }

    @Override
    public List<PartyStatementRow> getArStatement(Long customerId, Long tenantId, LocalDate from, LocalDate to) {
        List<Long> arAccountIds = getArAccountIds(tenantId);
        if (arAccountIds.isEmpty())
            return new ArrayList<>();

        List<PartyStatementRow> statement = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        if (from != null) {
            Object[] ob = (Object[]) subLedgerRepository.getPartyOpeningBalance(tenantId, arAccountIds, customerId,
                    from)[0];
            if (ob != null && ob.length > 0) {
                BigDecimal obDebit = ob[0] != null ? (BigDecimal) ob[0] : BigDecimal.ZERO;
                BigDecimal obCredit = ob[1] != null ? (BigDecimal) ob[1] : BigDecimal.ZERO;
                runningBalance = obDebit.subtract(obCredit);
                if (runningBalance.compareTo(BigDecimal.ZERO) != 0) {
                    statement.add(PartyStatementRow.builder()
                            .documentType("OPENING_BALANCE")
                            .description("Opening Balance as of " + from)
                            .debitAmount(BigDecimal.ZERO)
                            .creditAmount(BigDecimal.ZERO)
                            .runningBalance(runningBalance)
                            .isOpeningBalance(true)
                            .build());
                }
            }
        }

        List<Object[]> results = subLedgerRepository.getPartyStatementRowsFiltered(tenantId, arAccountIds, customerId,
                from, to);

        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];

            BigDecimal debit = jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO;
            runningBalance = runningBalance.add(debit).subtract(credit);

            statement.add(PartyStatementRow.builder()
                    .journalEntryId(je.getJournalEntryId())
                    .entryNumber(je.getEntryNumber())
                    .entryDate(je.getEntryDate())
                    .dueDate(je.getDueDate())
                    .documentType(je.getDocumentType().name())
                    .referenceNumber(je.getReferenceNumber())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getDescription())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance)
                    .build());
        }

        return statement;
    }

    @Override
    public List<AgingReportRow> getArAgingReport(Long tenantId, LocalDate asOfDate) {
        List<PartySubLedgerResponse> summaries = calculateArAging(tenantId, asOfDate);
        List<AgingReportRow> report = new ArrayList<>();
        for (PartySubLedgerResponse sum : summaries) {
            report.add(AgingReportRow.builder()
                    .partyId(sum.getPartyId())
                    .partyName(sum.getPartyName())
                    .totalOutstanding(sum.getBalance())
                    .current(sum.getAgingCurrent())
                    .days1to30(sum.getAging30())
                    .days31to60(sum.getAging60())
                    .days61to90(sum.getAging90())
                    .daysOver90(sum.getAgingOver90())
                    .build());
        }
        return report;
    }

    private List<PartySubLedgerResponse> calculateApAging(Long tenantId, LocalDate asOfDate) {
        List<Long> apAccountIds = getApAccountIds(tenantId);
        if (apAccountIds.isEmpty())
            return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getLinesWithDueDate(tenantId, apAccountIds);

        Map<Long, List<Object[]>> partyLines = new HashMap<>();
        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            Long partyId = jel.getDimCompanyId();
            if (partyId != null) {
                partyLines.computeIfAbsent(partyId, k -> new ArrayList<>()).add(row);
            }
        }

        List<PartySubLedgerResponse> summaries = new ArrayList<>();

        for (Map.Entry<Long, List<Object[]>> entry : partyLines.entrySet()) {
            Long partyId = entry.getKey();
            List<Object[]> lines = entry.getValue();

            BigDecimal totalDebit = BigDecimal.ZERO;
            BigDecimal totalCredit = BigDecimal.ZERO;

            Map<Long, JournalEntry> invoices = new HashMap<>();
            Map<Long, BigDecimal> invoiceAmounts = new HashMap<>();
            Map<Long, BigDecimal> linkedPayments = new HashMap<>();
            BigDecimal unlinkedDebits = BigDecimal.ZERO;

            for (Object[] row : lines) {
                JournalEntryLine jel = (JournalEntryLine) row[0];
                JournalEntry je = (JournalEntry) row[1];

                BigDecimal debit = jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO;
                BigDecimal credit = jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO;

                totalDebit = totalDebit.add(debit);
                totalCredit = totalCredit.add(credit);

                BigDecimal netCr = credit.subtract(debit);

                if (je.getLinkedInvoice() != null) {
                    Long linkedInvoiceJeId = je.getLinkedInvoice().getJournalEntryId();
                    BigDecimal currentPayment = debit.subtract(credit);
                    linkedPayments.put(linkedInvoiceJeId,
                            linkedPayments.getOrDefault(linkedInvoiceJeId, BigDecimal.ZERO).add(currentPayment));
                } else {
                    if (netCr.compareTo(BigDecimal.ZERO) > 0) {
                        invoices.put(je.getJournalEntryId(), je);
                        invoiceAmounts.put(je.getJournalEntryId(),
                                invoiceAmounts.getOrDefault(je.getJournalEntryId(), BigDecimal.ZERO).add(netCr));
                    } else if (netCr.compareTo(BigDecimal.ZERO) < 0) {
                        unlinkedDebits = unlinkedDebits.add(netCr.negate());
                    }
                }
            }

            BigDecimal balance = totalCredit.subtract(totalDebit);

            BigDecimal agingCurrent = BigDecimal.ZERO;
            BigDecimal aging30 = BigDecimal.ZERO;
            BigDecimal aging60 = BigDecimal.ZERO;
            BigDecimal aging90 = BigDecimal.ZERO;
            BigDecimal agingOver90 = BigDecimal.ZERO;

            for (Map.Entry<Long, JournalEntry> invEntry : invoices.entrySet()) {
                Long invId = invEntry.getKey();
                JournalEntry invJe = invEntry.getValue();
                BigDecimal invTotal = invoiceAmounts.get(invId);
                BigDecimal invPayments = linkedPayments.getOrDefault(invId, BigDecimal.ZERO);

                BigDecimal remaining = invTotal.subtract(invPayments);
                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    LocalDate effectiveDate = invJe.getDueDate() != null ? invJe.getDueDate() : invJe.getEntryDate();
                    long daysOverdue = ChronoUnit.DAYS.between(effectiveDate, asOfDate);

                    if (daysOverdue <= 0) {
                        agingCurrent = agingCurrent.add(remaining);
                    } else if (daysOverdue <= 30) {
                        aging30 = aging30.add(remaining);
                    } else if (daysOverdue <= 60) {
                        aging60 = aging60.add(remaining);
                    } else if (daysOverdue <= 90) {
                        aging90 = aging90.add(remaining);
                    } else {
                        agingOver90 = agingOver90.add(remaining);
                    }
                }
            }

            if (unlinkedDebits.compareTo(BigDecimal.ZERO) > 0) {
                if (unlinkedDebits.compareTo(agingOver90) >= 0) {
                    unlinkedDebits = unlinkedDebits.subtract(agingOver90);
                    agingOver90 = BigDecimal.ZERO;
                } else {
                    agingOver90 = agingOver90.subtract(unlinkedDebits);
                    unlinkedDebits = BigDecimal.ZERO;
                }

                if (unlinkedDebits.compareTo(aging90) >= 0) {
                    unlinkedDebits = unlinkedDebits.subtract(aging90);
                    aging90 = BigDecimal.ZERO;
                } else {
                    aging90 = aging90.subtract(unlinkedDebits);
                    unlinkedDebits = BigDecimal.ZERO;
                }

                if (unlinkedDebits.compareTo(aging60) >= 0) {
                    unlinkedDebits = unlinkedDebits.subtract(aging60);
                    aging60 = BigDecimal.ZERO;
                } else {
                    aging60 = aging60.subtract(unlinkedDebits);
                    unlinkedDebits = BigDecimal.ZERO;
                }

                if (unlinkedDebits.compareTo(aging30) >= 0) {
                    unlinkedDebits = unlinkedDebits.subtract(aging30);
                    aging30 = BigDecimal.ZERO;
                } else {
                    aging30 = aging30.subtract(unlinkedDebits);
                    unlinkedDebits = BigDecimal.ZERO;
                }

                if (unlinkedDebits.compareTo(agingCurrent) >= 0) {
                    unlinkedDebits = unlinkedDebits.subtract(agingCurrent);
                    agingCurrent = BigDecimal.ZERO;
                } else {
                    agingCurrent = agingCurrent.subtract(unlinkedDebits);
                    unlinkedDebits = BigDecimal.ZERO;
                }

                if (unlinkedDebits.compareTo(BigDecimal.ZERO) > 0) {
                    agingCurrent = agingCurrent.subtract(unlinkedDebits);
                }
            }

            summaries.add(PartySubLedgerResponse.builder()
                    .partyId(partyId)
                    .partyName(getPartyName(partyId, tenantId))
                    .partyCode(getPartyCode(partyId, tenantId))
                    .totalDebit(totalDebit)
                    .totalCredit(totalCredit)
                    .balance(balance)
                    .agingCurrent(agingCurrent)
                    .aging30(aging30)
                    .aging60(aging60)
                    .aging90(aging90)
                    .agingOver90(agingOver90)
                    .build());
        }

        return summaries;
    }

    @Override
    public List<PartySubLedgerResponse> getApSummary(Long tenantId) {
        return calculateApAging(tenantId, LocalDate.now());
    }

    @Override
    public List<PartyStatementRow> getApStatement(Long supplierId, Long tenantId, LocalDate from, LocalDate to) {
        List<Long> apAccountIds = getApAccountIds(tenantId);
        if (apAccountIds.isEmpty())
            return new ArrayList<>();

        List<PartyStatementRow> statement = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        if (from != null) {
            Object[] ob = (Object[]) subLedgerRepository.getPartyOpeningBalance(tenantId, apAccountIds, supplierId,
                    from)[0];
            if (ob != null && ob.length > 0) {
                BigDecimal obDebit = ob[0] != null ? (BigDecimal) ob[0] : BigDecimal.ZERO;
                BigDecimal obCredit = ob[1] != null ? (BigDecimal) ob[1] : BigDecimal.ZERO;
                runningBalance = obCredit.subtract(obDebit);
                if (runningBalance.compareTo(BigDecimal.ZERO) != 0) {
                    statement.add(PartyStatementRow.builder()
                            .documentType("OPENING_BALANCE")
                            .description("Opening Balance as of " + from)
                            .debitAmount(BigDecimal.ZERO)
                            .creditAmount(BigDecimal.ZERO)
                            .runningBalance(runningBalance)
                            .isOpeningBalance(true)
                            .build());
                }
            }
        }

        List<Object[]> results = subLedgerRepository.getPartyStatementRowsFiltered(tenantId, apAccountIds, supplierId,
                from, to);

        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];

            BigDecimal debit = jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO;
            runningBalance = runningBalance.add(credit).subtract(debit);

            statement.add(PartyStatementRow.builder()
                    .journalEntryId(je.getJournalEntryId())
                    .entryNumber(je.getEntryNumber())
                    .entryDate(je.getEntryDate())
                    .dueDate(je.getDueDate())
                    .documentType(je.getDocumentType().name())
                    .referenceNumber(je.getReferenceNumber())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getDescription())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance)
                    .build());
        }

        return statement;
    }

    @Override
    public List<AgingReportRow> getApAgingReport(Long tenantId, LocalDate asOfDate) {
        List<PartySubLedgerResponse> summaries = calculateApAging(tenantId, asOfDate);
        List<AgingReportRow> report = new ArrayList<>();
        for (PartySubLedgerResponse sum : summaries) {
            report.add(AgingReportRow.builder()
                    .partyId(sum.getPartyId())
                    .partyName(sum.getPartyName())
                    .totalOutstanding(sum.getBalance())
                    .current(sum.getAgingCurrent())
                    .days1to30(sum.getAging30())
                    .days31to60(sum.getAging60())
                    .days61to90(sum.getAging90())
                    .daysOver90(sum.getAgingOver90())
                    .build());
        }
        return report;
    }

    private List<Long> getEmployeeAccountIds(Long tenantId) {
        List<Long> accountIds = new ArrayList<>();
        employeeGLAccountRepository.findAllByTenant(tenantId).forEach(e -> {
            if (e.getSalaryPayableAccount() != null)
                accountIds.add(e.getSalaryPayableAccount().getAccountId());
            if (e.getAdvanceAccount() != null)
                accountIds.add(e.getAdvanceAccount().getAccountId());
            if (e.getExpenseAccount() != null)
                accountIds.add(e.getExpenseAccount().getAccountId());
        });
        return accountIds.stream().distinct().collect(Collectors.toList());
    }

    private List<Long> getBankAccountIds(Long tenantId) {
        return bankGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(b -> b.getGlAccount() != null)
                .map(b -> b.getGlAccount().getAccountId())
                .distinct()
                .collect(Collectors.toList());
    }

    private String getEmployeeName(Long employeeId, Long tenantId) {
        if (employeeId == null)
            return "Unknown Employee";
        return employeeRepository.findById(employeeId)
                .map(Employee::getName)
                .orElse("Unknown Employee " + employeeId);
    }

    private String getBankName(Long bankAccountId, Long tenantId) {
        if (bankAccountId == null)
            return "Unknown Bank";
        return companyBankAccountRepository.findById(bankAccountId)
                .map(CompanyBankAccount::getBankName)
                .orElse("Unknown Bank " + bankAccountId);
    }

    @Override
    public List<PartySubLedgerResponse> getEmployeeSummary(Long tenantId) {
        List<Long> empAccountIds = getEmployeeAccountIds(tenantId);
        if (empAccountIds.isEmpty())
            return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getEmployeeBalances(tenantId, empAccountIds);
        return results.stream().map(row -> {
            Long empId = (Long) row[0];
            BigDecimal totalDebit = (BigDecimal) row[1];
            BigDecimal totalCredit = (BigDecimal) row[2];
            BigDecimal balance = (BigDecimal) row[3]; // positive means liability (credit > debit) typically, but let's
                                                      // just return balance.

            return PartySubLedgerResponse.builder()
                    .partyId(empId)
                    .partyName(getEmployeeName(empId, tenantId))
                    .totalDebit(totalDebit != null ? totalDebit : BigDecimal.ZERO)
                    .totalCredit(totalCredit != null ? totalCredit : BigDecimal.ZERO)
                    .balance(balance != null ? balance : BigDecimal.ZERO)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<PartyStatementRow> getEmployeeStatement(Long employeeId, Long tenantId, LocalDate from, LocalDate to) {
        List<Long> empAccountIds = getEmployeeAccountIds(tenantId);
        if (empAccountIds.isEmpty())
            return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getEmployeeStatementRows(tenantId, empAccountIds, employeeId);
        List<PartyStatementRow> statement = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];

            if ((from != null && je.getEntryDate().isBefore(from)) ||
                    (to != null && je.getEntryDate().isAfter(to))) {
                continue;
            }

            BigDecimal debit = jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO;
            runningBalance = runningBalance.add(credit).subtract(debit); // assuming liability nature

            statement.add(PartyStatementRow.builder()
                    .journalEntryId(je.getJournalEntryId())
                    .entryNumber(je.getEntryNumber())
                    .entryDate(je.getEntryDate())
                    .documentType(je.getDocumentType().name())
                    .referenceNumber(je.getReferenceNumber())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getDescription())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance)
                    .build());
        }
        return statement;
    }

    @Override
    public List<PartySubLedgerResponse> getBankSummary(Long tenantId) {
        List<Long> bankAccountIds = getBankAccountIds(tenantId);
        if (bankAccountIds.isEmpty())
            return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getBankBalances(tenantId, bankAccountIds);
        return results.stream().map(row -> {
            Long bankId = (Long) row[0];
            BigDecimal totalDebit = (BigDecimal) row[1];
            BigDecimal totalCredit = (BigDecimal) row[2];
            BigDecimal balance = (BigDecimal) row[3]; // debit - credit

            return PartySubLedgerResponse.builder()
                    .partyId(bankId)
                    .partyName(getBankName(bankId, tenantId))
                    .totalDebit(totalDebit != null ? totalDebit : BigDecimal.ZERO)
                    .totalCredit(totalCredit != null ? totalCredit : BigDecimal.ZERO)
                    .balance(balance != null ? balance : BigDecimal.ZERO)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<PartyStatementRow> getBankStatement(Long bankAccountId, Long tenantId, LocalDate from, LocalDate to) {
        List<Long> bankAccountIds = getBankAccountIds(tenantId);
        if (bankAccountIds.isEmpty())
            return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getBankStatementRows(tenantId, bankAccountIds, bankAccountId);
        List<PartyStatementRow> statement = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];

            if ((from != null && je.getEntryDate().isBefore(from)) ||
                    (to != null && je.getEntryDate().isAfter(to))) {
                continue;
            }

            BigDecimal debit = jel.getDebitAmount() != null ? jel.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = jel.getCreditAmount() != null ? jel.getCreditAmount() : BigDecimal.ZERO;
            runningBalance = runningBalance.add(debit).subtract(credit);

            statement.add(PartyStatementRow.builder()
                    .journalEntryId(je.getJournalEntryId())
                    .entryNumber(je.getEntryNumber())
                    .entryDate(je.getEntryDate())
                    .documentType(je.getDocumentType().name())
                    .referenceNumber(je.getReferenceNumber())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getDescription())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance)
                    .build());
        }
        return statement;
    }
}
