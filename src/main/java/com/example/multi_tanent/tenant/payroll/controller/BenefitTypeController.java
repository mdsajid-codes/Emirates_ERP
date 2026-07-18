package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.BenefitTypeRequest;
import com.example.multi_tanent.tenant.payroll.dto.BenefitTypeResponse;
import com.example.multi_tanent.tenant.payroll.service.BenefitTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/benefit-types")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN')")
public class BenefitTypeController {

    private final BenefitTypeService benefitTypeService;

    public BenefitTypeController(BenefitTypeService benefitTypeService) {
        this.benefitTypeService = benefitTypeService;
    }

    @PostMapping
    public ResponseEntity<BenefitTypeResponse> createBenefitType(@Valid @RequestBody BenefitTypeRequest request) {
        var created = benefitTypeService.createBenefitType(request);
        return new ResponseEntity<>(BenefitTypeResponse.fromEntity(created), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BenefitTypeResponse>> getAllBenefitTypes() {
        var list = benefitTypeService.getAllBenefitTypes().stream()
                .map(BenefitTypeResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BenefitTypeResponse> updateBenefitType(@PathVariable Long id, @Valid @RequestBody BenefitTypeRequest request) {
        var updated = benefitTypeService.updateBenefitType(id, request);
        return ResponseEntity.ok(BenefitTypeResponse.fromEntity(updated));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<BenefitTypeResponse> toggleActiveStatus(@PathVariable Long id) {
        var updated = benefitTypeService.toggleActiveStatus(id);
        return ResponseEntity.ok(BenefitTypeResponse.fromEntity(updated));
    }
}