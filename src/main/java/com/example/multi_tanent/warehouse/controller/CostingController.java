package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.warehouse.dto.CostingDto;
import com.example.multi_tanent.warehouse.service.CostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/costing")
@RequiredArgsConstructor
public class CostingController {

    private final CostingService costingService;
    private final TenantRepository tenantRepository;

    @GetMapping("/summary")
    public ResponseEntity<List<CostingDto>> getCostingSummary(
            @RequestParam(required = false) Long warehouseId) {
        
        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(costingService.getCostingSummary(tenant.getId(), warehouseId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<CostingDto> calculateProductCosting(
            @PathVariable Long productId,
            @RequestParam(required = false) Long warehouseId) {
        
        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(costingService.calculateProductCosting(productId, tenant.getId(), warehouseId));
    }

    private Tenant getCurrentTenant() {
        String tenantIdentifier = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Tenant context missing or invalid"));
    }
}
