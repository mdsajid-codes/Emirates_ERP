package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.EmployeeBiometricMappingRequest;
import com.example.multi_tanent.tenant.attendance.entity.EmployeeBiometricMapping;
import com.example.multi_tanent.tenant.attendance.service.EmployeeBiometricMappingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/employee-biometric-mappings")
@CrossOrigin(origins = "*")
public class EmployeeBiometricMappingController {
    private final EmployeeBiometricMappingService mappingService;

    public EmployeeBiometricMappingController(EmployeeBiometricMappingService mappingService) {
        this.mappingService = mappingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<EmployeeBiometricMapping> createMapping(@RequestBody EmployeeBiometricMappingRequest request) {
        EmployeeBiometricMapping createdMapping = mappingService.createMapping(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdMapping.getId()).toUri();
        return ResponseEntity.created(location).body(createdMapping);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeBiometricMapping>> getAllMappings() {
        return ResponseEntity.ok(mappingService.getAllMappings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeBiometricMapping> getMappingById(@PathVariable Long id) {
        return mappingService.getMappingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<EmployeeBiometricMapping> updateMapping(@PathVariable Long id, @RequestBody EmployeeBiometricMappingRequest request) {
        EmployeeBiometricMapping updatedMapping = mappingService.updateMapping(id, request);
        return ResponseEntity.ok(updatedMapping);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        mappingService.deleteMapping(id);
        return ResponseEntity.noContent().build();
    }
}
