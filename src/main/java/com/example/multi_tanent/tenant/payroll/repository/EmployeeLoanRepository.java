package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeLoan;
import com.example.multi_tanent.tenant.payroll.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeLoanRepository extends JpaRepository<EmployeeLoan, Long> {
    List<EmployeeLoan> findByEmployeeEmployeeCodeAndStatus(String employeeCode, LoanStatus status);
    List<EmployeeLoan> findByEmployeeId(Long employeeId);
    List<EmployeeLoan> findByEmployeeInAndStatus(List<Employee> employees, LoanStatus status);
    Optional<EmployeeLoan> findByEmployeeIdAndStatus(Long employeeId, LoanStatus status);
}