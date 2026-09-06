package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmActivitySummaryDto;
import com.example.multi_tanent.crm.dto.CrmAuditLogDto;
import com.example.multi_tanent.crm.dto.CrmGroupedCountDto;
import com.example.multi_tanent.crm.dto.CrmLeadTrendDto;
import com.example.multi_tanent.crm.dto.CrmTopPerformerDto;
import com.example.multi_tanent.crm.services.CrmReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/crm/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmReportController {

    private final CrmReportService reportService;

    @GetMapping("/leads-by-stage")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> leadsByStage() {
        return ResponseEntity.ok(reportService.getLeadsByStage());
    }

    @GetMapping("/leads-by-owner")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> leadsByOwner() {
        return ResponseEntity.ok(reportService.getLeadsByOwner());
    }

    @GetMapping("/leads-by-status")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> leadsByStatus() {
        return ResponseEntity.ok(reportService.getLeadsByStatus());
    }

    @GetMapping("/leads-by-source")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> leadsBySource() {
        return ResponseEntity.ok(reportService.getLeadsBySource());
    }

    @GetMapping("/leads-by-industry")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> leadsByIndustry() {
        return ResponseEntity.ok(reportService.getLeadsByIndustry());
    }

    @GetMapping("/lost-by-stage")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> lostByStage() {
        return ResponseEntity.ok(reportService.getLostByStage());
    }

    @GetMapping("/lost-by-reason")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmGroupedCountDto>> lostByReason() {
        return ResponseEntity.ok(reportService.getLostByReason());
    }

    @GetMapping("/lead-trend")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmLeadTrendDto>> leadTrend(@RequestParam(defaultValue = "YEARLY") String period) {
        return ResponseEntity.ok(reportService.getLeadTrend(period));
    }

    @GetMapping("/top-performers")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmTopPerformerDto>> topPerformers() {
        return ResponseEntity.ok(reportService.getTopPerformers());
    }

    @GetMapping("/activity-summary")
    @PreAuthorize("@crmAccess.canView('REPORT')")
    public ResponseEntity<List<CrmActivitySummaryDto>> activitySummary() {
        return ResponseEntity.ok(reportService.getActivitySummary());
    }

    @GetMapping("/audit-log")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CRM_ADMIN')")
    public ResponseEntity<Page<CrmAuditLogDto>> auditLog(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Pageable pageable
    ) {
        return ResponseEntity.ok(reportService.getAuditLog(action, entityType, fromDate, toDate, pageable));
    }
}
