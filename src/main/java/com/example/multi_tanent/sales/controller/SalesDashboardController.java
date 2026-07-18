package com.example.multi_tanent.sales.controller;

import com.example.multi_tanent.sales.dto.SalesDashboardResponse;
import com.example.multi_tanent.sales.service.SalesDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales/dashboard")
@RequiredArgsConstructor
public class SalesDashboardController {

    private final SalesDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<SalesDashboardResponse> getDashboardData() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }
}
