package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.SalaryStructureRequest;
import com.example.multi_tanent.tenant.payroll.dto.SyncSalaryStructureRequest;
import com.example.multi_tanent.tenant.payroll.dto.SalaryStructureResponse;
import com.example.multi_tanent.tenant.payroll.service.SalaryStructureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/salary-structures")
@CrossOrigin(origins = "*")
public class SalaryStructureController {

    private final SalaryStructureService salaryStructureService;

    public SalaryStructureController(SalaryStructureService salaryStructureService) {
        this.salaryStructureService = salaryStructureService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<SalaryStructureResponse> createSalaryStructure(@RequestBody SalaryStructureRequest request) {
        var createdStructure = salaryStructureService.createSalaryStructure(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdStructure.getId()).toUri();
        return ResponseEntity.created(location).body(SalaryStructureResponse.fromEntity(createdStructure));
    }

    @GetMapping("/employee/{employeeCode}")
    @PreAuthorize("isAuthenticated()") // TODO: Add finer-grained security to check if user is the employee or HR/Admin
    public ResponseEntity<SalaryStructureResponse> getSalaryStructureByEmployeeCode(@PathVariable String employeeCode) {
        return salaryStructureService.getSalaryStructureByEmployeeCode(employeeCode)
                .map(structure -> ResponseEntity.ok(SalaryStructureResponse.fromEntity(structure)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<List<SalaryStructureResponse>> getAllSalaryStructures() {
        List<SalaryStructureResponse> structures = salaryStructureService.getAllSalaryStructures()
                .stream()
                .map(SalaryStructureResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(structures);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<SalaryStructureResponse> updateSalaryStructure(@PathVariable Long id, @RequestBody SalaryStructureRequest request) {
        var updatedStructure = salaryStructureService.updateSalaryStructure(id, request);
        return ResponseEntity.ok(SalaryStructureResponse.fromEntity(updatedStructure));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteSalaryStructure(@PathVariable Long id) {
        salaryStructureService.deleteSalaryStructure(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> syncSalaryStructure(@RequestBody SyncSalaryStructureRequest request) {
        salaryStructureService.syncStructure(request);
        return ResponseEntity.ok().build();
    }
}
