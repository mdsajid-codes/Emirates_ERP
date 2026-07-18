package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.PayslipTemplateRequest;
import com.example.multi_tanent.tenant.payroll.dto.PayslipTemplateResponse;
import com.example.multi_tanent.tenant.payroll.service.PayslipTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payslip-templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaySlipTemplateController {

    private final PayslipTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<PayslipTemplateResponse>> getAll() {
        return ResponseEntity.ok(templateService.getAllForTenant());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayslipTemplateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PayslipTemplateResponse> create(@Valid @RequestBody PayslipTemplateRequest request) {
        return new ResponseEntity<>(templateService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PayslipTemplateResponse> update(@PathVariable Long id, @Valid @RequestBody PayslipTemplateRequest request) {
        return ResponseEntity.ok(templateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/set-default")
    public ResponseEntity<PayslipTemplateResponse> setDefault(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.setDefault(id));
    }
}
