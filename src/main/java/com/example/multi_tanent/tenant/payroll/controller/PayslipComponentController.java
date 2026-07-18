package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.PayslipComponentResponse;
import com.example.multi_tanent.tenant.payroll.service.PayslipComponentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payslip-components")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class PayslipComponentController {

    private final PayslipComponentService payslipComponentService;

    public PayslipComponentController(PayslipComponentService payslipComponentService) {
        this.payslipComponentService = payslipComponentService;
    }

    @GetMapping("/payslip/{payslipId}")
    public ResponseEntity<List<PayslipComponentResponse>> getComponentsByPayslipId(@PathVariable Long payslipId) {
        List<PayslipComponentResponse> components = payslipComponentService.getComponentsByPayslipId(payslipId).stream()
                .map(PayslipComponentResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(components);
    }
}
