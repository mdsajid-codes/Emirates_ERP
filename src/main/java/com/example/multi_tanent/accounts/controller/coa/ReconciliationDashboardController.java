package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.subledger.ReconciliationStatusRow;
import com.example.multi_tanent.accounts.dto.subledger.UntaggedLineRow;
import com.example.multi_tanent.accounts.service.subledger.ReconciliationDashboardService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/sub-ledger/reconciliation-summary")
@RequiredArgsConstructor
public class ReconciliationDashboardController {

    private final ReconciliationDashboardService reconciliationDashboardService;
    private final TenantRepository tenantRepository;

    private Long resolveTenantId() {
        String tenantIdStr = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalStateException("Tenant context not initialized properly."))
                .getId();
    }

    private <T> ResponseEntity<Map<String, Object>> createResponse(T data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSummary() {
        Long tenantId = resolveTenantId();
        List<ReconciliationStatusRow> summary = reconciliationDashboardService.getReconciliationSummary(tenantId);
        return createResponse(summary, "Reconciliation summary fetched successfully");
    }

    @GetMapping("/{subLedgerKey}")
    public ResponseEntity<Map<String, Object>> getUntaggedLines(@PathVariable String subLedgerKey) {
        Long tenantId = resolveTenantId();
        List<UntaggedLineRow> untaggedLines = reconciliationDashboardService.getUntaggedLines(subLedgerKey, tenantId);
        return createResponse(untaggedLines, "Untagged lines fetched successfully");
    }
}
