package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.EmployeeShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeShiftAssignmentRepository extends JpaRepository<EmployeeShiftAssignment, Long> {
    Optional<EmployeeShiftAssignment> findByEmployee_IdAndAssignedDate(Long employeeId, LocalDate assignedDate);
    List<EmployeeShiftAssignment> findByEmployee_Id(Long employeeId);
    List<EmployeeShiftAssignment> findByAssignedDate(LocalDate date);
}
