package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.subledger.InventoryMovementRow;
import com.example.multi_tanent.accounts.dto.subledger.InventorySubLedgerSummary;
import com.example.multi_tanent.accounts.service.subledger.InventorySubLedgerService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/sub-ledger/inventory")
@RequiredArgsConstructor
public class InventorySubLedgerController {

    private final InventorySubLedgerService inventorySubLedgerService;
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

    @GetMapping
    public ResponseEntity<?> getInventorySummary() {
        List<InventorySubLedgerSummary> data = inventorySubLedgerService.getInventorySummary(resolveTenantId());
        return createResponse(data);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<?> getInventoryMovement(
            @PathVariable Long itemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        List<InventoryMovementRow> rows = inventorySubLedgerService.getInventoryMovement(itemId, resolveTenantId(), dateFrom, dateTo);
        Map<String, Object> data = new HashMap<>();
        data.put("itemId", itemId);
        data.put("openingBalance", BigDecimal.ZERO);
        data.put("closingBalance", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningBalance());
        data.put("closingQty", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningQty());
        data.put("rows", rows);

        return createResponse(data);
    }

    @GetMapping("/valuation")
    public ResponseEntity<?> getStockValuation() {
        List<InventorySubLedgerSummary> data = inventorySubLedgerService.getStockValuation(resolveTenantId());
        return createResponse(data);
    }
}
