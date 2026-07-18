package com.example.multi_tanent.accounts.controller.reports;

import com.example.multi_tanent.accounts.dto.reports.BalanceSheetResponse;
import com.example.multi_tanent.accounts.dto.reports.GeneralLedgerRow;
import com.example.multi_tanent.accounts.dto.reports.IncomeStatementResponse;
import com.example.multi_tanent.accounts.dto.reports.TrialBalanceRow;
import com.example.multi_tanent.accounts.service.reports.BalanceSheetService;
import com.example.multi_tanent.accounts.service.reports.FinancialReportExportService;
import com.example.multi_tanent.accounts.service.reports.GeneralLedgerReportService;
import com.example.multi_tanent.accounts.service.reports.IncomeStatementService;
import com.example.multi_tanent.accounts.service.reports.TrialBalanceService;
import com.example.multi_tanent.accounts.service.journal.AuditLogService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/reports")
@RequiredArgsConstructor
public class FinancialReportsController {

    private final TenantRepository tenantRepository;
    private final TrialBalanceService trialBalanceService;
    private final IncomeStatementService incomeStatementService;
    private final BalanceSheetService balanceSheetService;
    private final GeneralLedgerReportService generalLedgerReportService;
    private final FinancialReportExportService exportService;
    private final AuditLogService auditLogService;

    private Long resolveTenantId() {
        String tenantIdStr = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalStateException("Tenant context not initialized properly."))
                .getId();
    }

    private ResponseEntity<?> createResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<?> getTrialBalance(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_GENERATED", "TRIAL_BALANCE", tenantId, username, null, "Period: " + fromDate + " to " + toDate);

        List<TrialBalanceRow> data = trialBalanceService.getTrialBalance(tenantId, fromDate, toDate);
        return createResponse(data);
    }

    @GetMapping("/income-statement")
    public ResponseEntity<?> getIncomeStatement(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_GENERATED", "INCOME_STATEMENT", tenantId, username, null, "Period: " + fromDate + " to " + toDate);

        IncomeStatementResponse data = incomeStatementService.getIncomeStatement(tenantId, fromDate, toDate);
        return createResponse(data);
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<?> getBalanceSheet(
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_GENERATED", "BALANCE_SHEET", tenantId, username, null, "As of date: " + toDate);

        BalanceSheetResponse data = balanceSheetService.getBalanceSheet(tenantId, toDate);
        return createResponse(data);
    }

    @GetMapping("/general-ledger/{accountId}")
    public ResponseEntity<?> getGeneralLedger(
            @PathVariable("accountId") Long accountId,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_GENERATED", "GENERAL_LEDGER", accountId, username, null, "Period: " + fromDate + " to " + toDate);

        List<GeneralLedgerRow> data = generalLedgerReportService.getGeneralLedgerReport(tenantId, accountId, fromDate, toDate);
        return createResponse(data);
    }

    // EXPORT ENDPOINTS

    @GetMapping("/trial-balance/export/excel")
    public ResponseEntity<byte[]> exportTrialBalanceExcel(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_EXPORTED", "TRIAL_BALANCE_EXCEL", tenantId, username, null, "Period: " + fromDate + " to " + toDate);

        byte[] fileBytes = exportService.exportTrialBalanceExcel(tenantId, fromDate, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=trial_balance.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(fileBytes);
    }

    @GetMapping("/trial-balance/export/pdf")
    public ResponseEntity<byte[]> exportTrialBalancePdf(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_EXPORTED", "TRIAL_BALANCE_PDF", tenantId, username, null, "Period: " + fromDate + " to " + toDate);

        byte[] fileBytes = exportService.exportTrialBalancePdf(tenantId, fromDate, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=trial_balance.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fileBytes);
    }

    @GetMapping("/income-statement/export/excel")
    public ResponseEntity<byte[]> exportIncomeStatementExcel(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_EXPORTED", "INCOME_STATEMENT_EXCEL", tenantId, username, null, "Period: " + fromDate + " to " + toDate);

        byte[] fileBytes = exportService.exportIncomeStatementExcel(tenantId, fromDate, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=income_statement.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(fileBytes);
    }

    @GetMapping("/income-statement/export/pdf")
    public ResponseEntity<byte[]> exportIncomeStatementPdf(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (fromDate == null) {
            fromDate = LocalDate.now().withDayOfYear(1);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_EXPORTED", "INCOME_STATEMENT_PDF", tenantId, username, null, "Period: " + fromDate + " to " + toDate);

        byte[] fileBytes = exportService.exportIncomeStatementPdf(tenantId, fromDate, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=income_statement.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fileBytes);
    }

    @GetMapping("/balance-sheet/export/excel")
    public ResponseEntity<byte[]> exportBalanceSheetExcel(
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_EXPORTED", "BALANCE_SHEET_EXCEL", tenantId, username, null, "As of date: " + toDate);

        byte[] fileBytes = exportService.exportBalanceSheetExcel(tenantId, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=balance_sheet.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(fileBytes);
    }

    @GetMapping("/balance-sheet/export/pdf")
    public ResponseEntity<byte[]> exportBalanceSheetPdf(
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long tenantId = resolveTenantId();
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        String username = userDetails != null ? userDetails.getUsername() : "system";
        auditLogService.log("REPORT_EXPORTED", "BALANCE_SHEET_PDF", tenantId, username, null, "As of date: " + toDate);

        byte[] fileBytes = exportService.exportBalanceSheetPdf(tenantId, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=balance_sheet.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fileBytes);
    }
}
