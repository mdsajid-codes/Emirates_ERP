package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {

    Optional<SalaryStructure> findByEmployeeId(Long employeeId);

    @Query("SELECT ss FROM SalaryStructure ss " +
           "LEFT JOIN FETCH ss.components ssc " +
           "LEFT JOIN FETCH ssc.salaryComponent sc " +
           "WHERE ss.employee.id = :employeeId")
    Optional<SalaryStructure> findByEmployeeIdWithDetails(@Param("employeeId") Long employeeId);
}