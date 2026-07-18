package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveAllocationRepository extends JpaRepository<LeaveAllocation, Long> {
    Optional<LeaveAllocation> findByEmployeeIdAndLeaveTypeIdAndPeriodStartAndPeriodEnd(
            Long employeeId, Long leaveTypeId, LocalDate periodStart, LocalDate periodEnd);

    @Query("SELECT la FROM LeaveAllocation la JOIN FETCH la.employee e JOIN FETCH la.leaveType WHERE e.employeeCode = :employeeCode")
    List<LeaveAllocation> findByEmployeeEmployeeCode(@Param("employeeCode") String employeeCode);
    boolean existsByLeaveTypeId(Long leaveTypeId);

}