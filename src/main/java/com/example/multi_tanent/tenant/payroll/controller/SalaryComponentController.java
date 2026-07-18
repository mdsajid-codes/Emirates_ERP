package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.SalaryComponentRequest;
import com.example.multi_tanent.tenant.payroll.dto.SalaryComponentResponse;
import com.example.multi_tanent.tenant.payroll.service.SalaryComponentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/salary-components")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR')")
public class SalaryComponentController {

    private final SalaryComponentService salaryComponentService;

    public SalaryComponentController(SalaryComponentService salaryComponentService) {
        this.salaryComponentService = salaryComponentService;
    }

    @PostMapping
    public ResponseEntity<SalaryComponentResponse> createSalaryComponent(@Valid @RequestBody SalaryComponentRequest request) {
        var createdComponent = salaryComponentService.createSalaryComponent(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdComponent.getId()).toUri();
        return ResponseEntity.created(location).body(SalaryComponentResponse.fromEntity(createdComponent));
    }

    @GetMapping
    public ResponseEntity<List<SalaryComponentResponse>> getAllSalaryComponents() {
        List<SalaryComponentResponse> components = salaryComponentService.getAllSalaryComponents().stream()
                .map(SalaryComponentResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(components);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaryComponentResponse> getSalaryComponentById(@PathVariable Long id) {
        return salaryComponentService.getSalaryComponentById(id)
                .map(component -> ResponseEntity.ok(SalaryComponentResponse.fromEntity(component)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaryComponentResponse> updateSalaryComponent(@PathVariable Long id, @Valid @RequestBody SalaryComponentRequest request) {
        var updatedComponent = salaryComponentService.updateSalaryComponent(id, request);
        return ResponseEntity.ok(SalaryComponentResponse.fromEntity(updatedComponent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalaryComponent(@PathVariable Long id) {
        salaryComponentService.deleteSalaryComponent(id);
        return ResponseEntity.noContent().build();
    }
}