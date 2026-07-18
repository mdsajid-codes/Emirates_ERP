package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.ReportDashboardDataDTO;
import com.example.multi_tanent.fleet.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("fleetReportController")
@RequestMapping("/api/fleet/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated data for reports dashboard")
    public ResponseEntity<ReportDashboardDataDTO> getDashboardData(
            @RequestParam(required = false, defaultValue = "MONTH") String timeFilter,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(reportService.getDashboardData(timeFilter, startDate, endDate));
    }
}
