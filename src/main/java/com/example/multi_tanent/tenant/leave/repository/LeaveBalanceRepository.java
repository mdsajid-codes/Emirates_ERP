package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    @Query("SELECT lb FROM LeaveBalance lb JOIN FETCH lb.employee e JOIN FETCH lb.leaveType WHERE e.employeeCode = :employeeCode")
    List<LeaveBalance> findByEmployeeEmployeeCode(@Param("employeeCode") String employeeCode);
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndAsOfDate(Long employeeId, Long leaveTypeId, LocalDate asOfDate);
    Optional<LeaveBalance> findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(Long employeeId, Long leaveTypeId);
    boolean existsByLeaveTypeId(Long leaveTypeId);
    List<LeaveBalance> findByEmployeeId(Long id);

}