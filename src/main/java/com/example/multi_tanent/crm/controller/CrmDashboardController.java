package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmDashboardResponse;
import com.example.multi_tanent.crm.services.CrmDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmDashboardController {

    private final CrmDashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("@crmAccess.canView('DASHBOARD')")
    public ResponseEntity<CrmDashboardResponse> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
}
