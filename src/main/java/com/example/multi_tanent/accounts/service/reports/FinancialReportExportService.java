package com.example.multi_tanent.accounts.service.reports;

import java.time.LocalDate;

public interface FinancialReportExportService {
    byte[] exportTrialBalanceExcel(Long tenantId, LocalDate fromDate, LocalDate toDate);
    byte[] exportTrialBalancePdf(Long tenantId, LocalDate fromDate, LocalDate toDate);
    
    byte[] exportIncomeStatementExcel(Long tenantId, LocalDate fromDate, LocalDate toDate);
    byte[] exportIncomeStatementPdf(Long tenantId, LocalDate fromDate, LocalDate toDate);
    
    byte[] exportBalanceSheetExcel(Long tenantId, LocalDate toDate);
    byte[] exportBalanceSheetPdf(Long tenantId, LocalDate toDate);
}
