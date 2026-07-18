package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurDashboardResponse;
import com.example.multi_tanent.purchases.service.PurDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchases/dashboard")
@RequiredArgsConstructor
public class PurDashboardController {

    private final PurDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<PurDashboardResponse> getDashboardData() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }
}
