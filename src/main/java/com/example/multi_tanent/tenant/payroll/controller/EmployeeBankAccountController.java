package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.EmployeeBankAccountRequest;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeBankAccountResponse;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeBankAccount;
import com.example.multi_tanent.tenant.payroll.service.EmployeeBankAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/employee-bank-accounts")
@CrossOrigin(origins = "*")
public class EmployeeBankAccountController {

    private final EmployeeBankAccountService bankAccountService;

    public EmployeeBankAccountController(EmployeeBankAccountService bankAccountService) {
        this.bankAccountService = bankAccountService;
    }

    @GetMapping("/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmployeeBankAccountResponse> getBankAccount(@PathVariable String employeeCode) {
        return bankAccountService.getBankAccountByEmployeeCode(employeeCode)
                .map(account -> ResponseEntity.ok(EmployeeBankAccountResponse.fromEntity(account)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{employeeCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<EmployeeBankAccountResponse> createOrUpdateBankAccount(@PathVariable String employeeCode, @RequestBody EmployeeBankAccountRequest request) {
        boolean isNew = bankAccountService.getBankAccountByEmployeeCode(employeeCode).isEmpty();
        EmployeeBankAccount savedAccount = bankAccountService.createOrUpdateBankAccount(employeeCode, request);
        EmployeeBankAccountResponse responseDto = EmployeeBankAccountResponse.fromEntity(savedAccount);

        if (isNew) {
            URI location = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
            return ResponseEntity.created(location).body(responseDto);
        } else {
            return ResponseEntity.ok(responseDto);
        }
    }

    @DeleteMapping("/{employeeCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable String employeeCode) {
        bankAccountService.deleteBankAccount(employeeCode);
        return ResponseEntity.noContent().build();
    }
}
