package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.warehouse.dto.WarehouseReportDto;
import com.example.multi_tanent.warehouse.service.WarehouseReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/warehouse/reports")
@RequiredArgsConstructor
public class WarehouseReportController {

    private final WarehouseReportService reportService;
    private final TenantRepository tenantRepository;

    @GetMapping("/stock-ledger")
    public ResponseEntity<List<WarehouseReportDto.StockLedgerEntry>> getStockLedger(
            @RequestParam Long productId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(reportService.getStockLedger(productId, tenant.getId(), from, to));
    }

    @GetMapping("/stock-valuation")
    public ResponseEntity<List<WarehouseReportDto.StockValuationItem>> getStockValuation(
            @RequestParam(required = false) Long warehouseId) {

        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(reportService.getStockValuation(tenant.getId(), warehouseId));
    }

    @GetMapping("/transfer-history")
    public ResponseEntity<List<WarehouseReportDto.TransferHistoryItem>> getTransferHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(reportService.getTransferHistory(tenant.getId(), from, to));
    }

    @GetMapping("/delivery-performance")
    public ResponseEntity<List<WarehouseReportDto.DeliveryPerformanceItem>> getDeliveryPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(reportService.getDeliveryPerformance(tenant.getId(), from, to));
    }

    private Tenant getCurrentTenant() {
        String tenantIdentifier = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Tenant context missing or invalid"));
    }
}
