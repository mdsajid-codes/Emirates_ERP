package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.DriverPerformanceRequest;
import com.example.multi_tanent.fleet.dtos.DriverPerformanceResponse;
import com.example.multi_tanent.fleet.service.DriverPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fleet/performance")
@RequiredArgsConstructor
public class DriverPerformanceController {

    private final DriverPerformanceService performanceService;

    @PostMapping
    public ResponseEntity<DriverPerformanceResponse> savePerformance(@RequestBody DriverPerformanceRequest request) {
        return ResponseEntity.ok(performanceService.savePerformance(request));
    }

    @PostMapping("/calculate")
    public ResponseEntity<DriverPerformanceResponse> calculateMetrics(
            @RequestParam Long driverId,
            @RequestParam String period) {
        return ResponseEntity.ok(performanceService.calculateMetrics(driverId, period));
    }

    @GetMapping
    public ResponseEntity<Page<DriverPerformanceResponse>> listAll(
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(performanceService.listAll(driverId, period, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverPerformanceResponse> getPerformance(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.getPerformance(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformance(@PathVariable Long id) {
        performanceService.deletePerformance(id);
        return ResponseEntity.noContent().build();
    }
}
