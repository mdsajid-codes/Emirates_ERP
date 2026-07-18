package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.PayrollSettingRequest;
import com.example.multi_tanent.tenant.payroll.dto.PayrollSettingResponse;
import com.example.multi_tanent.tenant.payroll.entity.PayrollSetting;
import com.example.multi_tanent.tenant.payroll.service.PayrollSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payroll-settings")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
public class PayrollSettingController {

    private final PayrollSettingService payrollSettingService;

    public PayrollSettingController(PayrollSettingService payrollSettingService) {
        this.payrollSettingService = payrollSettingService;
    }

    @GetMapping
    public ResponseEntity<PayrollSettingResponse> getPayrollSetting() {
        PayrollSetting setting = payrollSettingService.getPayrollSetting();
        return ResponseEntity.ok(PayrollSettingResponse.fromEntity(setting));
    }

    @PostMapping
    public ResponseEntity<PayrollSettingResponse> createOrUpdatePayrollSetting(@RequestBody PayrollSettingRequest request) {
        PayrollSetting setting = payrollSettingService.createOrUpdatePayrollSetting(request);
        return ResponseEntity.ok(PayrollSettingResponse.fromEntity(setting));
    }
}
