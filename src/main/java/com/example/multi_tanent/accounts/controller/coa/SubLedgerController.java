package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.subledger.AgingReportRow;
import com.example.multi_tanent.accounts.dto.subledger.PartyStatementRow;
import com.example.multi_tanent.accounts.dto.subledger.PartySubLedgerResponse;
import com.example.multi_tanent.accounts.service.subledger.SubLedgerService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryRepository;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/accounts/sub-ledger")
@RequiredArgsConstructor
public class SubLedgerController {

    private final SubLedgerService subLedgerService;
    private final TenantRepository tenantRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final JournalEntryRepository journalEntryRepository;

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

    @GetMapping("/debug-ar")
    public ResponseEntity<?> debugAr() {
        Map<String, Object> debugInfo = new HashMap<>();
        try {
            Long tenantId = resolveTenantId();
            debugInfo.put("tenantId", tenantId);
            
            List<Long> arAccountIds = partyGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(p -> p.getPartyType() == com.example.multi_tanent.accounts.entity.enums.PartyType.CUSTOMER && p.getAccountsReceivable() != null)
                .map(p -> p.getAccountsReceivable().getAccountId())
                .distinct()
                .collect(java.util.stream.Collectors.toList());
            debugInfo.put("arAccountIds", arAccountIds);
            
            List<Map<String, Object>> linesData = new java.util.ArrayList<>();
            List<JournalEntry> entries = journalEntryRepository.findAll();
            for (JournalEntry je : entries) {
                for (JournalEntryLine jel : je.getLines()) {
                    Map<String, Object> ld = new HashMap<>();
                    ld.put("journalEntryId", je.getJournalEntryId());
                    ld.put("status", je.getStatus().name());
                    ld.put("tenantId", je.getTenantId());
                    ld.put("accountId", jel.getAccount() != null ? jel.getAccount().getAccountId() : null);
                    ld.put("dimCompanyId", jel.getDimCompanyId());
                    ld.put("debitAmount", jel.getDebitAmount());
                    ld.put("creditAmount", jel.getCreditAmount());
                    linesData.add(ld);
                }
            }
            debugInfo.put("journalEntryLines", linesData);
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
        }
        return createResponse(debugInfo);
    }

    @GetMapping("/ar")
    public ResponseEntity<?> getArSummary() {
        List<PartySubLedgerResponse> data = subLedgerService.getArSummary(resolveTenantId());
        return createResponse(data);
    }

    @GetMapping("/ar/{customerId}")
    public ResponseEntity<?> getArStatement(
            @PathVariable Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        List<PartyStatementRow> rows = subLedgerService.getArStatement(customerId, resolveTenantId(), dateFrom, dateTo);
        Map<String, Object> data = new HashMap<>();
        data.put("partyId", customerId);
        
        // Find party name (a bit of a hack, but fine for now or we could fetch it explicitly)
        String partyName = "Unknown";
        if (!rows.isEmpty()) {
            data.put("partyName", "Customer " + customerId); // In real app, fetch customer name
        }
        
        data.put("openingBalance", BigDecimal.ZERO);
        data.put("closingBalance", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningBalance());
        data.put("rows", rows);

        return createResponse(data);
    }

    @GetMapping("/ar/aging")
    public ResponseEntity<?> getArAgingReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        List<AgingReportRow> data = subLedgerService.getArAgingReport(resolveTenantId(), date);
        return createResponse(data);
    }

    @GetMapping("/ap")
    public ResponseEntity<?> getApSummary() {
        List<PartySubLedgerResponse> data = subLedgerService.getApSummary(resolveTenantId());
        return createResponse(data);
    }

    @GetMapping("/ap/{supplierId}")
    public ResponseEntity<?> getApStatement(
            @PathVariable Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        List<PartyStatementRow> rows = subLedgerService.getApStatement(supplierId, resolveTenantId(), dateFrom, dateTo);
        Map<String, Object> data = new HashMap<>();
        data.put("partyId", supplierId);
        data.put("openingBalance", BigDecimal.ZERO);
        data.put("closingBalance", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningBalance());
        data.put("rows", rows);

        return createResponse(data);
    }

    @GetMapping("/ap/aging")
    public ResponseEntity<?> getApAgingReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        List<AgingReportRow> data = subLedgerService.getApAgingReport(resolveTenantId(), date);
        return createResponse(data);
    }

    @GetMapping("/employee")
    public ResponseEntity<?> getEmployeeSummary() {
        List<PartySubLedgerResponse> data = subLedgerService.getEmployeeSummary(resolveTenantId());
        return createResponse(data);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeStatement(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        List<PartyStatementRow> rows = subLedgerService.getEmployeeStatement(employeeId, resolveTenantId(), dateFrom, dateTo);
        Map<String, Object> data = new HashMap<>();
        data.put("partyId", employeeId);
        data.put("partyName", "Employee " + employeeId);
        data.put("openingBalance", BigDecimal.ZERO);
        data.put("closingBalance", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningBalance());
        data.put("rows", rows);

        return createResponse(data);
    }

    @GetMapping("/bank")
    public ResponseEntity<?> getBankSummary() {
        List<PartySubLedgerResponse> data = subLedgerService.getBankSummary(resolveTenantId());
        return createResponse(data);
    }

    @GetMapping("/bank/{bankAccountId}")
    public ResponseEntity<?> getBankStatement(
            @PathVariable Long bankAccountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        List<PartyStatementRow> rows = subLedgerService.getBankStatement(bankAccountId, resolveTenantId(), dateFrom, dateTo);
        Map<String, Object> data = new HashMap<>();
        data.put("partyId", bankAccountId);
        data.put("partyName", "Bank Account " + bankAccountId);
        data.put("openingBalance", BigDecimal.ZERO);
        data.put("closingBalance", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningBalance());
        data.put("rows", rows);

        return createResponse(data);
    }
}
