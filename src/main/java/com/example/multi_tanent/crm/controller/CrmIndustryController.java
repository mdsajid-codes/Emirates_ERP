package com.example.multi_tanent.crm.controller;

import java.util.List; 

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.multi_tanent.crm.dto.CrmIndustryDto;
import com.example.multi_tanent.crm.dto.CrmIndustryRequest; 
import com.example.multi_tanent.crm.services.CrmIndustryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/settings/industries")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmIndustryController {

  private final CrmIndustryService industryService;

  @GetMapping
  @PreAuthorize("@crmAccess.canView('SETTINGS')")
  public ResponseEntity<List<CrmIndustryDto>> list() {
    return ResponseEntity.ok(industryService.getAllIndustries());
  }

  @GetMapping("/{id}")
  @PreAuthorize("@crmAccess.canView('SETTINGS')")
  public ResponseEntity<CrmIndustryDto> getById(@PathVariable Long id) {
    return ResponseEntity.ok(industryService.getIndustryById(id));
  }

  @PostMapping
  @PreAuthorize("@crmAccess.canCreate('SETTINGS')")
  public ResponseEntity<CrmIndustryDto> create(@Valid @RequestBody CrmIndustryRequest req) {
    return ResponseEntity.ok(industryService.create(req));
  }

  @PutMapping("/{id}")
  @PreAuthorize("@crmAccess.canUpdate('SETTINGS')")
  public ResponseEntity<CrmIndustryDto> update(@PathVariable Long id,
                                         @Valid @RequestBody CrmIndustryRequest req) {
    return ResponseEntity.ok(industryService.update(id, req));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("@crmAccess.canDelete('SETTINGS')")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    industryService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
