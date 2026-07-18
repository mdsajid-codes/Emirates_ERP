package com.example.multi_tanent.accounts.controller.vat;

import com.example.multi_tanent.accounts.dto.vat.*;
import com.example.multi_tanent.accounts.service.vat.VatService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounts/vat")
@RequiredArgsConstructor
public class VatController {

    private final VatService vatService;

    // --- VAT Groups ---

    @GetMapping("/groups")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<VatGroupResponse>> getAllGroups(@RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.getAllGroups(tenantId));
    }

    @PostMapping("/groups")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatGroupResponse> createGroup(@RequestBody VatGroupRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.createGroup(request, tenantId));
    }

    @PutMapping("/groups/{id}")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatGroupResponse> updateGroup(@PathVariable Long id, @RequestBody VatGroupRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.updateGroup(id, request, tenantId));
    }

    @DeleteMapping("/groups/{id}")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id, @RequestHeader("X-Tenant-ID") String tenantId) {
        vatService.deleteGroup(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    // --- VAT Types ---

    @GetMapping("/types")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<VatTypeResponse>> getAllTypes(@RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.getAllTypes(tenantId));
    }

    @PostMapping("/types")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatTypeResponse> createType(@RequestBody VatTypeRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.createType(request, tenantId));
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatTypeResponse> updateType(@PathVariable Long id, @RequestBody VatTypeRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.updateType(id, request, tenantId));
    }

    @DeleteMapping("/types/{id}")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteType(@PathVariable Long id, @RequestHeader("X-Tenant-ID") String tenantId) {
        vatService.deleteType(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    // --- VAT Rates ---

    @GetMapping("/rates")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<VatRateResponse>> getAllRates(@RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.getAllRates(tenantId));
    }

    @PostMapping("/rates")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatRateResponse> createRate(@RequestBody VatRateRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.createRate(request, tenantId));
    }

    @PutMapping("/rates/{id}")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatRateResponse> updateRate(@PathVariable Long id, @RequestBody VatRateRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.updateRate(id, request, tenantId));
    }

    @DeleteMapping("/rates/{id}")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteRate(@PathVariable Long id, @RequestHeader("X-Tenant-ID") String tenantId) {
        vatService.deleteRate(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    // --- Tax Transactions ---

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<TaxTransactionResponse>> getAllTaxTransactions(@RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.getAllTaxTransactions(tenantId));
    }

    @PostMapping("/transactions")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<TaxTransactionResponse> createTaxTransaction(@RequestBody TaxTransactionRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.createTaxTransaction(request, tenantId));
    }

    // --- Reports and Settlements ---

    @GetMapping("/liability")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatLiabilityResponse> getVatLiability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.calculateVatLiability(fromDate, toDate, tenantId));
    }

    @GetMapping("/return")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VatReturnResponse> getVatReturn(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.generateVatReturn(fromDate, toDate, tenantId));
    }

    @PostMapping("/settle")
    @PreAuthorize("hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> settleVatLiability(@RequestBody VatSettlementRequest request, @RequestHeader("X-Tenant-ID") String tenantId) {
        vatService.settleVatLiability(request, tenantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/output-report")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<VatTransactionLineResponse>> getOutputReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.getOutputVatTransactions(fromDate, toDate, tenantId));
    }

    @GetMapping("/input-report")
    @PreAuthorize("hasRole('ACCOUNTS_USER') or hasRole('ACCOUNTS_ADMIN') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<VatTransactionLineResponse>> getInputReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(vatService.getInputVatTransactions(fromDate, toDate, tenantId));
    }
}
