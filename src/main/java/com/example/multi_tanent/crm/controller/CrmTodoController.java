package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.*;
import com.example.multi_tanent.crm.services.CrmTodoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/crm/todos")
public class CrmTodoController {

    private final CrmTodoService service;

    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('TODO')")
    public ResponseEntity<CrmTodoResponse> create(@Valid @RequestBody CrmTodoRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('TODO')")
    public ResponseEntity<CrmTodoResponse> update(@PathVariable Long id, @Valid @RequestBody CrmTodoRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmAccess.canDelete('TODO')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('TODO')")
    public ResponseEntity<CrmTodoResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping("/search")
    @PreAuthorize("@crmAccess.canView('TODO')")
    public Page<CrmTodoResponse> search(@RequestBody(required = false) CrmTodoFilterRequest filter,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return service.search(filter, PageRequest.of(page, size));
    }

    @GetMapping("/subject-counts")
    @PreAuthorize("@crmAccess.canView('TODO')")
    public List<CrmTodoSubjectCount> subjectCounts() {
        return service.subjectCounts();
    }

    /* -------- labels ---------- */

    @GetMapping("/labels")
    @PreAuthorize("@crmAccess.canView('TODO')")
    public List<CrmTodoLabelResponse> labels() {
        return service.getLabels();
    }

    @PostMapping("/labels")
    @PreAuthorize("@crmAccess.canCreate('TODO')")
    public ResponseEntity<CrmTodoLabelResponse> createLabel(@Valid @RequestBody CrmTodoLabelRequest req) {
        return ResponseEntity.ok(service.createLabel(req));
    }

    @PutMapping("/labels/{id}")
    @PreAuthorize("@crmAccess.canUpdate('TODO')")
    public ResponseEntity<CrmTodoLabelResponse> updateLabel(@PathVariable Long id,
                                                         @Valid @RequestBody CrmTodoLabelRequest req) {
        return ResponseEntity.ok(service.updateLabel(id, req));
    }

    @DeleteMapping("/labels/{id}")
    @PreAuthorize("@crmAccess.canDelete('TODO')")
    public ResponseEntity<Void> deleteLabel(@PathVariable Long id) {
        service.deleteLabel(id);
        return ResponseEntity.noContent().build();
    }
}
