package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveEncashmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LeaveEncashmentRequestRepository extends JpaRepository<LeaveEncashmentRequest, Long> {
    @Query("SELECT ler FROM LeaveEncashmentRequest ler JOIN FETCH ler.employee e JOIN FETCH ler.leaveType WHERE e.employeeCode = :employeeCode")
    List<LeaveEncashmentRequest> findByEmployeeEmployeeCode(@Param("employeeCode") String employeeCode);
}