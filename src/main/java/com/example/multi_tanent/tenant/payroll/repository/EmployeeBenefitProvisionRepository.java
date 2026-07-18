package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.EmployeeBenefitProvision;
import com.example.multi_tanent.tenant.payroll.enums.ProvisionStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeBenefitProvisionRepository extends JpaRepository<EmployeeBenefitProvision, Long> {
    List<EmployeeBenefitProvision> findByEmployeeIdAndStatus(Long employeeId, ProvisionStatus status);

    // Use JOIN FETCH to eagerly load related entities and prevent LazyInitializationException
    @Query("SELECT p FROM EmployeeBenefitProvision p JOIN FETCH p.employee JOIN FETCH p.benefitType LEFT JOIN FETCH p.confirmationFiles WHERE p.employee.employeeCode = :employeeCode")
    List<EmployeeBenefitProvision> findByEmployeeEmployeeCodeWithDetails(String employeeCode);

    List<EmployeeBenefitProvision> findByStatusAndCycleEndDateBefore(ProvisionStatus status, LocalDate date);

    // Add this new method to fetch by ID with all details
    @Query("SELECT p FROM EmployeeBenefitProvision p JOIN FETCH p.employee JOIN FETCH p.benefitType LEFT JOIN FETCH p.confirmationFiles WHERE p.id = :id")
    Optional<EmployeeBenefitProvision> findByIdWithDetails(Long id);
}