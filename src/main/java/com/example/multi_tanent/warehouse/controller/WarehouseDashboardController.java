package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.warehouse.dto.WarehouseDashboardDto;
import com.example.multi_tanent.warehouse.service.WarehouseDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warehouse/dashboard")
@RequiredArgsConstructor
public class WarehouseDashboardController {

    private final WarehouseDashboardService dashboardService;
    private final TenantRepository tenantRepository;

    @GetMapping
    public ResponseEntity<WarehouseDashboardDto> getDashboardStats() {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Tenant context missing or invalid"));
                
        return ResponseEntity.ok(dashboardService.getDashboardStats(tenant.getId()));
    }
}
