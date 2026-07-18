package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmActivitySummaryDto;
import com.example.multi_tanent.crm.dto.CrmAuditLogDto;
import com.example.multi_tanent.crm.dto.CrmGroupedCountDto;
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
