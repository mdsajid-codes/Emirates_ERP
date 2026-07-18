package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.EmployeeBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeBankAccountRepository extends JpaRepository<EmployeeBankAccount, Long> {
    Optional<EmployeeBankAccount> findByEmployeeId(Long employeeId);
}