package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    Optional<LeaveType> findByLeaveType(String leaveType);
    Optional<LeaveType> findByLeaveTypeIgnoreCase(String leaveType);

    List<LeaveType> findByActiveTrue();

}