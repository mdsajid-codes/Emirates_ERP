package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.payment.AccBankAccountRequest;
import com.example.multi_tanent.accounts.dto.payment.AccBankAccountResponse;
import com.example.multi_tanent.accounts.dto.payment.AccBankRequest;
import com.example.multi_tanent.accounts.dto.payment.AccBankResponse;
import com.example.multi_tanent.accounts.service.AccBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/banks")
@RequiredArgsConstructor
public class AccBankController {

    private final AccBankService bankService;

    // Banks
    @PostMapping
    public ResponseEntity<AccBankResponse> createBank(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestBody AccBankRequest request) {
        return ResponseEntity.ok(bankService.createBank(request, tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccBankResponse> getBank(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(bankService.getBank(id, tenantId));
    }

    @GetMapping
    public ResponseEntity<List<AccBankResponse>> getAllBanks(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(bankService.getAllBanks(tenantId));
    }

    // Bank Accounts
    @PostMapping("/accounts")
    public ResponseEntity<AccBankAccountResponse> createBankAccount(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestBody AccBankAccountRequest request) {
        return ResponseEntity.ok(bankService.createBankAccount(request, tenantId));
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<AccBankAccountResponse> updateBankAccount(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id,
            @RequestBody AccBankAccountRequest request) {
        return ResponseEntity.ok(bankService.updateBankAccount(id, request, tenantId));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<AccBankAccountResponse> getBankAccount(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(bankService.getBankAccount(id, tenantId));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccBankAccountResponse>> getAllBankAccounts(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(bankService.getAllBankAccounts(tenantId));
    }

    @GetMapping("/{bankId}/accounts")
    public ResponseEntity<List<AccBankAccountResponse>> getBankAccountsByBank(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long bankId) {
        return ResponseEntity.ok(bankService.getBankAccountsByBank(bankId, tenantId));
    }
}
