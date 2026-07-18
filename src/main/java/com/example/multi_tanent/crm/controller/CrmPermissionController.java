package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmPermissionDto;
import com.example.multi_tanent.crm.services.CrmPermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/permissions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmPermissionController {

    private final CrmPermissionService service;

    @GetMapping
    public ResponseEntity<List<CrmPermissionDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrmPermissionDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CrmPermissionDto> create(@Valid @RequestBody CrmPermissionDto req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrmPermissionDto> update(@PathVariable Long id,
                                                   @Valid @RequestBody CrmPermissionDto req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}