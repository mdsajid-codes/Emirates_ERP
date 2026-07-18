package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.SalaryStructureComponentResponse;
import com.example.multi_tanent.tenant.payroll.service.SalaryStructureComponentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/salary-structure-components")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
public class SalaryStructureComponentController {

    private final SalaryStructureComponentService componentService;

    public SalaryStructureComponentController(SalaryStructureComponentService componentService) {
        this.componentService = componentService;
    }

    @GetMapping("/structure/{structureId}")
    public ResponseEntity<List<SalaryStructureComponentResponse>> getComponentsByStructureId(@PathVariable Long structureId) {
        List<SalaryStructureComponentResponse> components = componentService.getComponentsByStructureId(structureId).stream()
                .map(SalaryStructureComponentResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(components);
    }
}
