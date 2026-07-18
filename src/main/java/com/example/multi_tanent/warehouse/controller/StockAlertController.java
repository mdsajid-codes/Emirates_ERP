package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.warehouse.dto.StockAlertDto;
import com.example.multi_tanent.warehouse.service.StockAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warehouse/stock-alerts")
@RequiredArgsConstructor
public class StockAlertController {

    private final StockAlertService alertService;
    private final TenantRepository tenantRepository;

    @GetMapping
    public ResponseEntity<StockAlertDto> getStockAlerts(
            @RequestParam(name = "expiryDays", defaultValue = "30") int expiryDays) {
        
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Tenant context missing or invalid"));

        return ResponseEntity.ok(alertService.getStockAlerts(tenant.getId(), expiryDays));
    }
}
