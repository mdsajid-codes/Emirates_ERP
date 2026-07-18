package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeBankAccountRequest;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeBankAccount;
import com.example.multi_tanent.tenant.payroll.repository.EmployeeBankAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class EmployeeBankAccountService {

    private final EmployeeBankAccountRepository bankAccountRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeBankAccountService(EmployeeBankAccountRepository bankAccountRepository, EmployeeRepository employeeRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.employeeRepository = employeeRepository;
    }

    public Optional<EmployeeBankAccount> getBankAccountByEmployeeCode(String employeeCode) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .flatMap(employee -> bankAccountRepository.findByEmployeeId(employee.getId()));
    }

    public EmployeeBankAccount createOrUpdateBankAccount(String employeeCode, EmployeeBankAccountRequest request) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .map(employee -> {
                    EmployeeBankAccount bankAccount = bankAccountRepository.findByEmployeeId(employee.getId())
                            .orElse(new EmployeeBankAccount());

                    if (bankAccount.getId() == null) {
                        bankAccount.setEmployee(employee);
                    }

                    mapRequestToEntity(request, bankAccount);
                    return bankAccountRepository.save(bankAccount);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + employeeCode));
    }

    public void deleteBankAccount(String employeeCode) {
        getBankAccountByEmployeeCode(employeeCode).ifPresent(bankAccountRepository::delete);
    }

    private void mapRequestToEntity(EmployeeBankAccountRequest req, EmployeeBankAccount entity) {
        entity.setBankName(req.getBankName());
        entity.setAccountNumber(req.getAccountNumber());
        entity.setIfscCode(req.getIfscCode());
        entity.setAccountHolderName(req.getAccountHolderName());
        entity.setIsPrimary(req.getIsPrimary());
    }
}