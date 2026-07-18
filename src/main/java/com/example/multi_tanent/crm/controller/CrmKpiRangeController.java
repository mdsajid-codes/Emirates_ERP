package com.example.multi_tanent.crm.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.multi_tanent.crm.dto.CrmKpiRangeRequest;
import com.example.multi_tanent.crm.entity.CrmKpiRange;
import com.example.multi_tanent.crm.services.CrmKpiRangeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crm/kpis/{kpiId}/ranges")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmKpiRangeController {
  private final CrmKpiRangeService kpiRangeService;

  @GetMapping
  @PreAuthorize("@crmAccess.canView('KPI')")
  public ResponseEntity<List<CrmKpiRange>> getAll(@PathVariable Long kpiId) {
    return ResponseEntity.ok(kpiRangeService.getAllByKpi(kpiId));
  }

  @GetMapping("/{id}")
  @PreAuthorize("@crmAccess.canView('KPI')")
  public ResponseEntity<CrmKpiRange> getById(@PathVariable Long kpiId, @PathVariable Long id) {
    return ResponseEntity.ok(kpiRangeService.getById(kpiId, id));
  }

  @PostMapping
  @PreAuthorize("@crmAccess.canCreate('KPI')")
  public ResponseEntity<CrmKpiRange> create(@PathVariable Long kpiId, @Valid @RequestBody CrmKpiRangeRequest req) {
    req.setKpiId(kpiId);
    return ResponseEntity.ok(kpiRangeService.create(req));
  }

  @PutMapping("/{id}")
  @PreAuthorize("@crmAccess.canUpdate('KPI')")
  public ResponseEntity<CrmKpiRange> update(@PathVariable Long kpiId, @PathVariable Long id,
      @Valid @RequestBody CrmKpiRangeRequest req) {
    req.setKpiId(kpiId);
    return ResponseEntity.ok(kpiRangeService.update(kpiId, id, req));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("@crmAccess.canDelete('KPI')")
  public ResponseEntity<Void> delete(@PathVariable Long kpiId, @PathVariable Long id) {
    kpiRangeService.delete(kpiId, id);
    return ResponseEntity.noContent().build();
  }
}
