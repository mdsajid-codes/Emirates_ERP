package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.EmployeeLoanResponse;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeLoanRequest;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeLoanResponse;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeLoan;
import com.example.multi_tanent.tenant.payroll.service.EmployeeLoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employee-loans")
@CrossOrigin(origins = "*")
public class EmployeeLoanController {

    private final EmployeeLoanService employeeLoanService;

    public EmployeeLoanController(EmployeeLoanService employeeLoanService) {
        this.employeeLoanService = employeeLoanService;
    }

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER', 'EMPLOYEE')")
    public ResponseEntity<EmployeeLoanResponse> requestLoan(@RequestBody EmployeeLoanRequest request) {
        EmployeeLoan newLoan = employeeLoanService.requestLoan(request);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/employee-loans/{id}")
                .buildAndExpand(newLoan.getId()).toUri();
        return ResponseEntity.created(location).body(EmployeeLoanResponse.fromEntity(newLoan));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<List<EmployeeLoanResponse>> getAllLoans() {
        List<EmployeeLoanResponse> loans = employeeLoanService.getAllLoans().stream()
                .map(EmployeeLoanResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(loans);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmployeeLoanResponse> getLoanById(@PathVariable Long id) {
        return employeeLoanService.getLoanById(id)
                .map(loan -> ResponseEntity.ok(EmployeeLoanResponse.fromEntity(loan)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EmployeeLoanResponse>> getLoansByEmployeeCode(@PathVariable String employeeCode) {
        List<EmployeeLoanResponse> loans = employeeLoanService.getLoansByEmployeeCode(employeeCode).stream()
                .map(EmployeeLoanResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(loans);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<EmployeeLoanResponse> approveLoan(@PathVariable Long id) {
        EmployeeLoan approvedLoan = employeeLoanService.approveLoan(id);
        return ResponseEntity.ok(EmployeeLoanResponse.fromEntity(approvedLoan));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<EmployeeLoanResponse> rejectLoan(@PathVariable Long id) {
        EmployeeLoan rejectedLoan = employeeLoanService.rejectLoan(id);
        return ResponseEntity.ok(EmployeeLoanResponse.fromEntity(rejectedLoan));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteLoan(@PathVariable Long id) {
        employeeLoanService.deleteLoan(id);
        return ResponseEntity.noContent().build();
    }
}
