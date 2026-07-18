package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.settlement.AccMutualSettlementRequest;
import com.example.multi_tanent.accounts.dto.settlement.AccMutualSettlementResponse;
import com.example.multi_tanent.accounts.service.AccMutualSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/settlements")
@RequiredArgsConstructor
public class AccMutualSettlementController {

    private final AccMutualSettlementService settlementService;

    @PostMapping
    public ResponseEntity<AccMutualSettlementResponse> createDraft(
            @RequestBody AccMutualSettlementRequest request,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(settlementService.createDraft(request, tenantId));
    }

    @PostMapping("/{id}/post")
    public ResponseEntity<AccMutualSettlementResponse> postSettlement(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(settlementService.postSettlement(id, tenantId));
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<AccMutualSettlementResponse> reverseSettlement(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(settlementService.reverseSettlement(id, tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccMutualSettlementResponse> getSettlement(
            @PathVariable Long id,
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(settlementService.getSettlement(id, tenantId));
    }

    @GetMapping
    public ResponseEntity<List<AccMutualSettlementResponse>> getAllSettlements(
            @RequestHeader("X-TenantID") String tenantId) {
        return ResponseEntity.ok(settlementService.getAllSettlements(tenantId));
    }
}
