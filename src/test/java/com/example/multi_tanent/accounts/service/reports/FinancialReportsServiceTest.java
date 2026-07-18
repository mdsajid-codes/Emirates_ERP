package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.*;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountBalanceType;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryLineRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialReportsServiceTest {

    @Mock
    private ChartOfAccountRepository chartOfAccountRepository;

    @Mock
    private JournalEntryLineRepository journalEntryLineRepository;

    @Mock
    private TrialBalanceService mockTrialBalanceService;

    @Mock
    private IncomeStatementService mockIncomeStatementService;

    @Mock
    private BalanceSheetService mockBalanceSheetService;

    private FinancialReportExportService exportService;

    @InjectMocks
    private TrialBalanceServiceImpl trialBalanceService;

    @InjectMocks
    private IncomeStatementServiceImpl incomeStatementService;

    @InjectMocks
    private BalanceSheetServiceImpl balanceSheetService;

    @InjectMocks
    private GeneralLedgerReportServiceImpl generalLedgerReportService;

    private Tenant tenant;
    private ChartOfAccount cashAccount;
    private ChartOfAccount capitalAccount;
    private ChartOfAccount revenueAccount;
    private ChartOfAccount expenseAccount;

    @BeforeEach
    void setUp() {
        exportService = new FinancialReportExportServiceImpl(mockTrialBalanceService, mockIncomeStatementService, mockBalanceSheetService);
        tenant = Tenant.builder().id(1L).tenantId("T1").build();

        cashAccount = ChartOfAccount.builder()
                .accountId(1L)
                .accountCode("1000")
                .description("Cash")
                .accountType(AccountBalanceType.DEBIT)
                .section(AccountSection.BS_CASH)
                .tenant(tenant)
                .build();

        capitalAccount = ChartOfAccount.builder()
                .accountId(2L)
                .accountCode("3000")
                .description("Share Capital")
                .accountType(AccountBalanceType.CREDIT)
                .section(AccountSection.BS_SHARE_CAPITAL)
                .tenant(tenant)
                .build();

        revenueAccount = ChartOfAccount.builder()
                .accountId(3L)
                .accountCode("4000")
                .description("Sales Goods")
                .accountType(AccountBalanceType.CREDIT)
                .section(AccountSection.PL_SALES_GOODS)
                .tenant(tenant)
                .build();

        expenseAccount = ChartOfAccount.builder()
                .accountId(4L)
                .accountCode("5000")
                .description("Rent Expense")
                .accountType(AccountBalanceType.DEBIT)
                .section(AccountSection.PL_ADMIN_EXPENSES)
                .tenant(tenant)
                .build();
    }

    @Test
    void testTrialBalance_CalculatesCorrectly() {
        List<ChartOfAccount> accounts = List.of(cashAccount, capitalAccount, revenueAccount, expenseAccount);
        when(chartOfAccountRepository.findAllByTenant(1L)).thenReturn(accounts);

        // Transaction 1: Opening balance (T1): Dr Cash 10000, Cr Capital 10000
        JournalEntry entry1 = JournalEntry.builder().journalEntryId(1L).entryDate(LocalDate.of(2026, 1, 1)).build();
        JournalEntryLine line1a = JournalEntryLine.builder().lineId(1L).account(cashAccount).debitAmount(BigDecimal.valueOf(10000)).build();
        JournalEntryLine line1b = JournalEntryLine.builder().lineId(2L).account(capitalAccount).creditAmount(BigDecimal.valueOf(10000)).build();

        // Transaction 2: In period (T2): Dr Cash 5000, Cr Revenue 5000
        JournalEntry entry2 = JournalEntry.builder().journalEntryId(2L).entryDate(LocalDate.of(2026, 2, 1)).build();
        JournalEntryLine line2a = JournalEntryLine.builder().lineId(3L).account(cashAccount).debitAmount(BigDecimal.valueOf(5000)).build();
        JournalEntryLine line2b = JournalEntryLine.builder().lineId(4L).account(revenueAccount).creditAmount(BigDecimal.valueOf(5000)).build();

        // Transaction 3: In period (T3): Dr Expense 1500, Cr Cash 1500
        JournalEntry entry3 = JournalEntry.builder().journalEntryId(3L).entryDate(LocalDate.of(2026, 2, 15)).build();
        JournalEntryLine line3a = JournalEntryLine.builder().lineId(5L).account(expenseAccount).debitAmount(BigDecimal.valueOf(1500)).build();
        JournalEntryLine line3b = JournalEntryLine.builder().lineId(6L).account(cashAccount).creditAmount(BigDecimal.valueOf(1500)).build();

        List<Object[]> linesWithEntries = List.of(
                new Object[]{line1a, entry1},
                new Object[]{line1b, entry1},
                new Object[]{line2a, entry2},
                new Object[]{line2b, entry2},
                new Object[]{line3a, entry3},
                new Object[]{line3b, entry3}
        );

        when(journalEntryLineRepository.findPostedLinesUpToDate(1L, LocalDate.of(2026, 2, 28)))
                .thenReturn(linesWithEntries);

        List<TrialBalanceRow> tb = trialBalanceService.getTrialBalance(1L, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 28));

        // Verify cash account row calculations
        TrialBalanceRow cashRow = tb.stream().filter(r -> r.getAccountId().equals(1L)).findFirst().orElseThrow();
        assertThat(cashRow.getOpeningDebit()).isEqualByComparingTo(BigDecimal.valueOf(10000));
        assertThat(cashRow.getDebitTurnover()).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(cashRow.getCreditTurnover()).isEqualByComparingTo(BigDecimal.valueOf(1500));
        assertThat(cashRow.getClosingDebit()).isEqualByComparingTo(BigDecimal.valueOf(13500));

        // Verify total debits equal total credits
        BigDecimal totalClosingDebit = tb.stream().map(TrialBalanceRow::getClosingDebit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalClosingCredit = tb.stream().map(TrialBalanceRow::getClosingCredit).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalClosingDebit).isEqualByComparingTo(totalClosingCredit);
    }

    @Test
    void testIncomeStatement_CalculatesNetProfit() {
        List<ChartOfAccount> accounts = List.of(cashAccount, capitalAccount, revenueAccount, expenseAccount);
        when(chartOfAccountRepository.findAllByTenant(1L)).thenReturn(accounts);

        JournalEntry entry = JournalEntry.builder().journalEntryId(1L).entryDate(LocalDate.of(2026, 2, 1)).build();
        JournalEntryLine revLine = JournalEntryLine.builder().lineId(1L).account(revenueAccount).creditAmount(BigDecimal.valueOf(5000)).build();
        JournalEntryLine expLine = JournalEntryLine.builder().lineId(2L).account(expenseAccount).debitAmount(BigDecimal.valueOf(1500)).build();

        List<Object[]> linesWithEntries = List.of(
                new Object[]{revLine, entry},
                new Object[]{expLine, entry}
        );

        when(journalEntryLineRepository.findPostedLinesUpToDate(1L, LocalDate.of(2026, 2, 28)))
                .thenReturn(linesWithEntries);

        IncomeStatementResponse statement = incomeStatementService.getIncomeStatement(1L, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 28));

        assertThat(statement.getGrossProfit()).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(statement.getNetProfit()).isEqualByComparingTo(BigDecimal.valueOf(3500));
    }

    @Test
    void testBalanceSheet_AssetsEqualsLiabilitiesAndEquity() {
        List<ChartOfAccount> accounts = List.of(cashAccount, capitalAccount, revenueAccount, expenseAccount);
        when(chartOfAccountRepository.findAllByTenant(1L)).thenReturn(accounts);

        // Transaction 1: Dr Cash 10000, Cr Capital 10000
        JournalEntry entry1 = JournalEntry.builder().journalEntryId(1L).entryDate(LocalDate.of(2026, 1, 1)).build();
        JournalEntryLine line1a = JournalEntryLine.builder().lineId(1L).account(cashAccount).debitAmount(BigDecimal.valueOf(10000)).build();
        JournalEntryLine line1b = JournalEntryLine.builder().lineId(2L).account(capitalAccount).creditAmount(BigDecimal.valueOf(10000)).build();

        // Transaction 2: Dr Cash 5000, Cr Revenue 5000
        JournalEntry entry2 = JournalEntry.builder().journalEntryId(2L).entryDate(LocalDate.of(2026, 2, 1)).build();
        JournalEntryLine line2a = JournalEntryLine.builder().lineId(3L).account(cashAccount).debitAmount(BigDecimal.valueOf(5000)).build();
        JournalEntryLine line2b = JournalEntryLine.builder().lineId(4L).account(revenueAccount).creditAmount(BigDecimal.valueOf(5000)).build();

        // Transaction 3: Dr Expense 1500, Cr Cash 1500
        JournalEntry entry3 = JournalEntry.builder().journalEntryId(3L).entryDate(LocalDate.of(2026, 2, 15)).build();
        JournalEntryLine line3a = JournalEntryLine.builder().lineId(5L).account(expenseAccount).debitAmount(BigDecimal.valueOf(1500)).build();
        JournalEntryLine line3b = JournalEntryLine.builder().lineId(6L).account(cashAccount).creditAmount(BigDecimal.valueOf(1500)).build();

        List<Object[]> linesWithEntries = List.of(
                new Object[]{line1a, entry1},
                new Object[]{line1b, entry1},
                new Object[]{line2a, entry2},
                new Object[]{line2b, entry2},
                new Object[]{line3a, entry3},
                new Object[]{line3b, entry3}
        );

        when(journalEntryLineRepository.findPostedLinesUpToDate(1L, LocalDate.of(2026, 2, 28)))
                .thenReturn(linesWithEntries);

        BalanceSheetResponse bs = balanceSheetService.getBalanceSheet(1L, LocalDate.of(2026, 2, 28));

        assertThat(bs.getTotalAssets()).isEqualByComparingTo(BigDecimal.valueOf(13500)); // Cash (10000 + 5000 - 1500)
        assertThat(bs.getTotalLiabilitiesAndEquity()).isEqualByComparingTo(BigDecimal.valueOf(13500)); // Capital (10000) + Net Profit (3500)
    }

    @Test
    void testGeneralLedgerReport_CalculatesRunningBalance() {
        when(chartOfAccountRepository.findById(1L)).thenReturn(Optional.of(cashAccount));

        JournalEntry entry1 = JournalEntry.builder().journalEntryId(1L).entryNumber("JE-001").entryDate(LocalDate.of(2026, 1, 1)).description("Opening").build();
        JournalEntryLine line1 = JournalEntryLine.builder().lineId(1L).journalEntry(entry1).debitAmount(BigDecimal.valueOf(10000)).build();

        JournalEntry entry2 = JournalEntry.builder().journalEntryId(2L).entryNumber("JE-002").entryDate(LocalDate.of(2026, 2, 15)).description("Sale").build();
        JournalEntryLine line2 = JournalEntryLine.builder().lineId(2L).journalEntry(entry2).debitAmount(BigDecimal.valueOf(5000)).build();

        when(journalEntryLineRepository.findPostedLinesByAccountUpToDate(1L, 1L, LocalDate.of(2026, 2, 28)))
                .thenReturn(List.of(line1, line2));

        List<GeneralLedgerRow> gl = generalLedgerReportService.getGeneralLedgerReport(1L, 1L, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 28));

        assertThat(gl).hasSize(2);
        assertThat(gl.get(0).getRunningBalance()).isEqualByComparingTo(BigDecimal.valueOf(10000)); // Opening Row at fromDate (Feb 1)
        assertThat(gl.get(1).getRunningBalance()).isEqualByComparingTo(BigDecimal.valueOf(15000)); // JE-002 Row (10000 + 5000)
    }

    @Test
    void testExports_generateValidByteArrays() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        // Mock Trial Balance data
        TrialBalanceRow tbRow = TrialBalanceRow.builder()
                .accountId(1L)
                .accountCode("1000")
                .description("Cash")
                .level(1)
                .isGroup(false)
                .openingDebit(BigDecimal.ZERO)
                .openingCredit(BigDecimal.ZERO)
                .debitTurnover(new BigDecimal("1500.00"))
                .creditTurnover(BigDecimal.ZERO)
                .closingDebit(new BigDecimal("1500.00"))
                .closingCredit(BigDecimal.ZERO)
                .children(new java.util.ArrayList<>())
                .build();
        when(mockTrialBalanceService.getTrialBalance(1L, from, to)).thenReturn(List.of(tbRow));

        // Mock Income Statement data
        IncomeStatementSection section = new IncomeStatementSection("Revenue", new ArrayList<>(), BigDecimal.ZERO);
        IncomeStatementResponse isResponse = new IncomeStatementResponse(List.of(section), BigDecimal.ZERO, BigDecimal.ZERO);
        when(mockIncomeStatementService.getIncomeStatement(1L, from, to)).thenReturn(isResponse);

        // Mock Balance Sheet data
        BalanceSheetSection bsSection = new BalanceSheetSection("Assets", new ArrayList<>(), BigDecimal.ZERO);
        BalanceSheetResponse bsResponse = new BalanceSheetResponse(List.of(bsSection), BigDecimal.ZERO, BigDecimal.ZERO, true);
        when(mockBalanceSheetService.getBalanceSheet(1L, to)).thenReturn(bsResponse);

        // Excel Exports
        byte[] tbExcel = exportService.exportTrialBalanceExcel(1L, from, to);
        byte[] isExcel = exportService.exportIncomeStatementExcel(1L, from, to);
        byte[] bsExcel = exportService.exportBalanceSheetExcel(1L, to);

        assertThat(tbExcel).isNotEmpty();
        assertThat(isExcel).isNotEmpty();
        assertThat(bsExcel).isNotEmpty();

        // PDF Exports
        byte[] tbPdf = exportService.exportTrialBalancePdf(1L, from, to);
        byte[] isPdf = exportService.exportIncomeStatementPdf(1L, from, to);
        byte[] bsPdf = exportService.exportBalanceSheetPdf(1L, to);

        assertThat(tbPdf).isNotEmpty();
        assertThat(isPdf).isNotEmpty();
        assertThat(bsPdf).isNotEmpty();
    }
}
