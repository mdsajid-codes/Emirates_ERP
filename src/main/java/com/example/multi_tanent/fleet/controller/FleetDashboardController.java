package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.FleetDashboardStatsResponse;
import com.example.multi_tanent.fleet.service.FleetDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fleet/dashboard")
@RequiredArgsConstructor
public class FleetDashboardController {

    private final FleetDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<FleetDashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
