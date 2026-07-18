package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.subledger.AssetMovementRow;
import com.example.multi_tanent.accounts.dto.subledger.FixedAssetRegisterRow;
import com.example.multi_tanent.accounts.service.subledger.FixedAssetSubLedgerService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/sub-ledger/fixed-assets")
@RequiredArgsConstructor
public class FixedAssetSubLedgerController {

    private final FixedAssetSubLedgerService fixedAssetSubLedgerService;
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
    public ResponseEntity<?> getFixedAssetRegister() {
        List<FixedAssetRegisterRow> data = fixedAssetSubLedgerService.getFixedAssetRegister(resolveTenantId());
        return createResponse(data);
    }

    @GetMapping("/{fixedAssetId}")
    public ResponseEntity<?> getAssetMovement(@PathVariable Long fixedAssetId) {
        List<AssetMovementRow> rows = fixedAssetSubLedgerService.getAssetMovement(fixedAssetId, resolveTenantId());
        Map<String, Object> data = new HashMap<>();
        data.put("fixedAssetId", fixedAssetId);
        data.put("openingBalance", BigDecimal.ZERO);
        data.put("closingBalance", rows.isEmpty() ? BigDecimal.ZERO : rows.get(rows.size() - 1).getRunningBalance());
        data.put("rows", rows);

        return createResponse(data);
    }
}
