package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.subledger.BankReconciliationDto;
import com.example.multi_tanent.accounts.service.subledger.BankReconciliationService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/sub-ledger/bank-reconciliation")
@RequiredArgsConstructor
public class BankReconciliationController {

    private final BankReconciliationService bankReconciliationService;
    private final TenantRepository tenantRepository;

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

    @PostMapping
    public ResponseEntity<?> createReconciliation(@RequestBody BankReconciliationDto dto) {
        BankReconciliationDto result = bankReconciliationService.createReconciliation(dto, resolveTenantId());
        return createResponse(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReconciliation(@PathVariable Long id) {
        BankReconciliationDto result = bankReconciliationService.getReconciliation(id, resolveTenantId());
        return createResponse(result);
    }

    @GetMapping("/bank/{bankAccountId}")
    public ResponseEntity<?> getReconciliationsByBank(@PathVariable Long bankAccountId) {
        List<BankReconciliationDto> result = bankReconciliationService.getReconciliationsByBank(bankAccountId, resolveTenantId());
        return createResponse(result);
    }

    @PutMapping("/match/{matchId}")
    public ResponseEntity<?> updateMatchStatus(@PathVariable Long matchId, @RequestParam Boolean isCleared) {
        BankReconciliationDto result = bankReconciliationService.updateMatchStatus(matchId, isCleared, resolveTenantId());
        return createResponse(result);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeReconciliation(@PathVariable Long id) {
        BankReconciliationDto result = bankReconciliationService.completeReconciliation(id, resolveTenantId());
        return createResponse(result);
    }
}
