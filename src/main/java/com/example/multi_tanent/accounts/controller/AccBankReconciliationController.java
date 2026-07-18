package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.reconciliation.BankReconciliationRequest;
import com.example.multi_tanent.accounts.dto.reconciliation.BankReconciliationResponse;
import com.example.multi_tanent.accounts.service.AccBankReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/reconciliations")
@RequiredArgsConstructor
public class AccBankReconciliationController {

    private final AccBankReconciliationService reconciliationService;

    @PostMapping("/start")
    public ResponseEntity<BankReconciliationResponse> startReconciliation(
            @RequestBody BankReconciliationRequest request,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.startReconciliation(request, tenantId));
    }

    @PostMapping("/{id}/auto-match")
    public ResponseEntity<BankReconciliationResponse> autoMatch(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.autoMatch(id, tenantId));
    }

    @PostMapping("/{id}/lines/import")
    public ResponseEntity<BankReconciliationResponse> importMockLines(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.importMockLines(id, tenantId));
    }

    @PostMapping("/lines/{lineId}/resolve")
    public ResponseEntity<BankReconciliationResponse> resolveDiscrepancy(
            @PathVariable Long lineId,
            @RequestParam Long journalEntryId,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.resolveDiscrepancy(lineId, journalEntryId, tenantId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<BankReconciliationResponse> completeReconciliation(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.completeReconciliation(id, tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankReconciliationResponse> getReconciliation(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.getReconciliation(id, tenantId));
    }

    @GetMapping("/bank/{bankAccountId}")
    public ResponseEntity<List<BankReconciliationResponse>> getReconciliationsByBank(
            @PathVariable Long bankAccountId,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(reconciliationService.getReconciliationsByBank(bankAccountId, tenantId));
    }
}
