package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.investment.AccCashEquivalentRequest;
import com.example.multi_tanent.accounts.dto.investment.AccCashEquivalentResponse;
import com.example.multi_tanent.accounts.service.AccCashEquivalentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/cash-equivalents")
@RequiredArgsConstructor
public class AccCashEquivalentController {

    private final AccCashEquivalentService cashEquivalentService;

    @PostMapping("/invest")
    public ResponseEntity<AccCashEquivalentResponse> invest(
            @RequestBody AccCashEquivalentRequest request,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashEquivalentService.invest(request, tenantId));
    }

    @PostMapping("/{id}/mature")
    public ResponseEntity<AccCashEquivalentResponse> mature(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashEquivalentService.mature(id, tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccCashEquivalentResponse> getInvestment(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashEquivalentService.getInvestment(id, tenantId));
    }

    @GetMapping
    public ResponseEntity<List<AccCashEquivalentResponse>> getAllInvestments(
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(cashEquivalentService.getAllInvestments(tenantId));
    }
}
