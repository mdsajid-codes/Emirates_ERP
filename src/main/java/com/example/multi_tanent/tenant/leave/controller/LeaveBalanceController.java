package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveBalanceRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import com.example.multi_tanent.tenant.leave.service.LeaveBalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave-balances")
@CrossOrigin(origins = "*")
public class LeaveBalanceController {

    private final LeaveBalanceService balanceService;

    public LeaveBalanceController(LeaveBalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveBalance> createOrUpdateBalance(@RequestBody LeaveBalanceRequest request) {
        LeaveBalance createdBalance = balanceService.createOrUpdateBalance(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdBalance.getId()).toUri();
        return ResponseEntity.created(location).body(createdBalance);
    }

    @GetMapping("/employee/{employeeCode}")
    public ResponseEntity<List<LeaveBalance>> getBalancesForEmployee(@PathVariable String employeeCode) {
        return ResponseEntity.ok(balanceService.getBalancesByEmployeeCode(employeeCode));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteBalance(@PathVariable Long id) {
        balanceService.deleteBalance(id);
        return ResponseEntity.noContent().build();
    }
}
