package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.entity.PosConsignmentSettlement;
import com.example.multi_tanent.pos.entity.PosPeriodLock;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.repository.PosPeriodLockRepository;
import com.example.multi_tanent.pos.repository.SaleRepository;
import com.example.multi_tanent.pos.service.PosConsignmentAccountingService;
import com.example.multi_tanent.pos.service.PosGlIntegrityScannerService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pos/phase4")
@RequiredArgsConstructor
public class PosPhase4Controller {

    private final PosPeriodLockRepository periodLockRepository;
    private final PosGlIntegrityScannerService integrityScannerService;
    private final PosConsignmentAccountingService consignmentAccountingService;
    private final SaleRepository saleRepository;
    private final TenantRepository tenantRepository;

    @PostMapping("/period-locks/close")
    public ResponseEntity<PosPeriodLock> closePeriod(@RequestBody ClosePeriodRequest request, Authentication authentication) {
        String tenantIdStr = (String) authentication.getDetails();
        String username = authentication.getName();

        PosPeriodLock lock = periodLockRepository.findByTenantIdAndPeriodName(tenantIdStr, request.getPeriodName())
                .orElse(new PosPeriodLock());

        lock.setTenantId(tenantIdStr);
        lock.setPeriodName(request.getPeriodName());
        lock.setStartDate(request.getStartDate());
        lock.setEndDate(request.getEndDate());
        lock.setIsClosed(true);
        lock.setClosedBy(username);
        lock.setClosedAt(LocalDateTime.now());

        PosPeriodLock saved = periodLockRepository.save(lock);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/period-locks")
    public ResponseEntity<List<PosPeriodLock>> getPeriodLocks(Authentication authentication) {
        String tenantIdStr = (String) authentication.getDetails();
        List<PosPeriodLock> locks = periodLockRepository.findByTenantId(tenantIdStr);
        return ResponseEntity.ok(locks);
    }

    @GetMapping("/integrity-scan")
    public ResponseEntity<PosGlIntegrityScannerService.IntegrityReportResponse> scanIntegrity(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            Authentication authentication) {

        String tenantIdStr = (String) authentication.getDetails();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantIdStr));

        PosGlIntegrityScannerService.IntegrityReportResponse report = integrityScannerService.scanPeriodIntegrity(tenant.getId(), startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/consignment/settle-vendor")
    public ResponseEntity<PosConsignmentSettlement> settleVendorConsignment(@RequestBody ConsignmentSettleRequest request, Authentication authentication) {
        String username = authentication.getName();
        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new IllegalArgumentException("Sale not found: " + request.getSaleId()));

        PosConsignmentSettlement settlement = consignmentAccountingService.processConsignmentSale(
                sale,
                request.getVendorId(),
                request.getVendorPayoutCents(),
                request.getStoreCommissionCents(),
                username
        );
        return ResponseEntity.ok(settlement);
    }

    @Data
    public static class ClosePeriodRequest {
        private String periodName;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    public static class ConsignmentSettleRequest {
        private Long saleId;
        private Long vendorId;
        private Long vendorPayoutCents;
        private Long storeCommissionCents;
    }
}
