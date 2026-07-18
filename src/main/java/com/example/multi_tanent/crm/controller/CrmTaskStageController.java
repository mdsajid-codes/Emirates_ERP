package com.example.multi_tanent.crm.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.multi_tanent.crm.dto.CrmTaskStageRequest;
import com.example.multi_tanent.crm.dto.CrmTaskStageResponse;
import com.example.multi_tanent.crm.services.CrmTaskStageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crm/task-stages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmTaskStageController {

    private final CrmTaskStageService service;

    // GET all (ordered)
    @GetMapping
    @PreAuthorize("@crmAccess.canView('SETTINGS')")
    public ResponseEntity<List<CrmTaskStageResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // GET by id
    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('SETTINGS')")
    public ResponseEntity<CrmTaskStageResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('SETTINGS')")
    public ResponseEntity<CrmTaskStageResponse> create(@Valid @RequestBody CrmTaskStageRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('SETTINGS')")
    public ResponseEntity<CrmTaskStageResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody CrmTaskStageRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("@crmAccess.canDelete('SETTINGS')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Reorder helpers
    @PostMapping("/{id}/move-up")
    @PreAuthorize("@crmAccess.canUpdate('SETTINGS')")
    public ResponseEntity<CrmTaskStageResponse> moveUp(@PathVariable Long id) {
        return ResponseEntity.ok(service.moveUp(id));
    }

    @PostMapping("/{id}/move-down")
    @PreAuthorize("@crmAccess.canUpdate('SETTINGS')")
    public ResponseEntity<CrmTaskStageResponse> moveDown(@PathVariable Long id) {
        return ResponseEntity.ok(service.moveDown(id));
    }

    // Set as default
    @PostMapping("/{id}/set-default")
    @PreAuthorize("@crmAccess.canUpdate('SETTINGS')")
    public ResponseEntity<CrmTaskStageResponse> setDefault(@PathVariable Long id) {
        return ResponseEntity.ok(service.setDefault(id));
    }
}