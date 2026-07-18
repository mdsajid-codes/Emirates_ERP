package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveRequest;
import com.example.multi_tanent.tenant.leave.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee JOIN FETCH lr.leaveType WHERE lr.currentApproverUserId = :approverUserId AND lr.status = :status")
    List<LeaveRequest> findByCurrentApproverUserIdAndStatus(@Param("approverUserId") Long approverUserId, @Param("status") LeaveStatus status);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee JOIN FETCH lr.leaveType WHERE lr.employee.id = :employeeId")
    List<LeaveRequest> findByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee JOIN FETCH lr.leaveType")
    List<LeaveRequest> findAllWithDetails();
    boolean existsByLeaveTypeId(Long leaveTypeId);

}