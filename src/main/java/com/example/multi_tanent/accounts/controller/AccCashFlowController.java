package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.cashflow.*;
import com.example.multi_tanent.accounts.service.AccCashFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccCashFlowController {

    private final AccCashFlowService cashFlowService;

    @PostMapping("/cash-flow-items")
    public ResponseEntity<CashFlowItemResponse> createItem(
            @RequestBody CashFlowItemRequest request,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashFlowService.createItem(request, tenantId));
    }

    @GetMapping("/cash-flow-items")
    public ResponseEntity<List<CashFlowItemResponse>> getAllItems(
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashFlowService.getAllItems(tenantId));
    }

    @PostMapping("/cash-flow-tx")
    public ResponseEntity<CashFlowTransactionResponse> createTransaction(
            @RequestBody CashFlowTransactionRequest request,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashFlowService.createTransaction(request, tenantId));
    }

    @GetMapping("/cash-flow-tx")
    public ResponseEntity<List<CashFlowTransactionResponse>> getAllTransactions(
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashFlowService.getAllTransactions(tenantId));
    }

    @GetMapping("/cash-flow-stmt")
    public ResponseEntity<CashFlowStatementResponse> generateStatement(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashFlowService.generateCashFlowStatement(from, to, tenantId));
    }
}
