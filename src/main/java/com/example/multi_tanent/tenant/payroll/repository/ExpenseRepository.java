package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("SELECT e FROM Expense e LEFT JOIN FETCH e.employee WHERE e.employee.employeeCode = :employeeCode")
    List<Expense> findByEmployeeEmployeeCode(@Param("employeeCode") String employeeCode);
}