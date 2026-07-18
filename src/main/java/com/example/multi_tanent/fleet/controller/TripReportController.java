package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.dtos.TripReportResponse;
import com.example.multi_tanent.fleet.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fleet/trip-reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripReportController {

    private final TripRepository tripRepository;
    private final TenantRepository tenantRepository;

    @GetMapping("/driver")
    public ResponseEntity<List<TripReportResponse>> getDriverReport(@RequestParam String month) {
        return ResponseEntity.ok(tripRepository.getDriverReportByMonth(getCurrentTenant(), month)
            .stream().map(row -> TripReportResponse.builder()
                .entityId((Long) row[0])
                .entityName(row[1] + " " + row[2])
                .tripCount((Long) row[3])
                .amount((BigDecimal) row[4])
                .commission((BigDecimal) row[5])
                .build()).collect(Collectors.toList()));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<TripReportResponse>> getCustomerReport(@RequestParam String month) {
        return ResponseEntity.ok(tripRepository.getCustomerReportByMonth(getCurrentTenant(), month)
            .stream().map(row -> TripReportResponse.builder()
                .entityId((Long) row[0])
                .entityName((String) row[1])
                .tripCount((Long) row[2])
                .totalAmount((BigDecimal) row[3])
                .build()).collect(Collectors.toList()));
    }

    @GetMapping("/vendor")
    public ResponseEntity<List<TripReportResponse>> getVendorReport(@RequestParam String month) {
        return ResponseEntity.ok(tripRepository.getVendorReportByMonth(getCurrentTenant(), month)
            .stream().map(row -> TripReportResponse.builder()
                .entityId((Long) row[0])
                .entityName((String) row[1])
                .tripCount((Long) row[2])
                .totalAmount((BigDecimal) row[3])
                .build()).collect(Collectors.toList()));
    }

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId).orElseThrow();
    }
}
