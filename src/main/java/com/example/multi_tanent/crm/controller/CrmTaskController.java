package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmTaskRequest;
import com.example.multi_tanent.crm.dto.CrmTaskResponse;
import com.example.multi_tanent.crm.services.CrmTaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/crm/tasks")
public class CrmTaskController {

    private final CrmTaskService service;

    @GetMapping
    @PreAuthorize("@crmAccess.canView('TASK')")
    public ResponseEntity<List<CrmTaskResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('TASK')")
    public ResponseEntity<CrmTaskResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/lead/{leadId}")
    @PreAuthorize("@crmAccess.canView('TASK')")
    public ResponseEntity<List<CrmTaskResponse>> getTasksByLeadId(@PathVariable Long leadId) {
        return ResponseEntity.ok(service.getTasksByLeadId(leadId));
    }

    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('TASK')")
    public ResponseEntity<CrmTaskResponse> create(@Valid @RequestBody CrmTaskRequest req) {
        CrmTaskResponse created = service.create(req);
        return ResponseEntity
                .created(URI.create("/api/crm/tasks/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('TASK')")
    public ResponseEntity<CrmTaskResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody CrmTaskRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmAccess.canDelete('TASK')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
