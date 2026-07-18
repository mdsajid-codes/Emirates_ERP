package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProductionDashboardDto;
import com.example.multi_tanent.production.services.ProductionDashboardService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/api/production/dashboard")
@RequiredArgsConstructor
public class ProductionDashboardController {

    private final ProductionDashboardService dashboardService;
    private final TenantRepository tenantRepository;

    @GetMapping("/stats")
    public ResponseEntity<ProductionDashboardDto> getDashboardStats(
            @RequestParam(defaultValue = "false") boolean isHangerTenant,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        String tenantIdStr = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Default: last 30 days if not provided
        OffsetDateTime fromDt = from != null
                ? LocalDate.parse(from).atStartOfDay().atOffset(ZoneOffset.UTC)
                : OffsetDateTime.now(ZoneOffset.UTC).minusDays(30);
        OffsetDateTime toDt = to != null
                ? LocalDate.parse(to).plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC)
                : OffsetDateTime.now(ZoneOffset.UTC);

        return ResponseEntity.ok(dashboardService.getDashboardStats(tenant.getId(), isHangerTenant, fromDt, toDt));
    }
}
