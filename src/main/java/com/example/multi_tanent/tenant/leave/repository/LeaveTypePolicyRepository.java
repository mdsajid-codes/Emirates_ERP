package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveTypePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveTypePolicyRepository extends JpaRepository<LeaveTypePolicy, Long> {
    boolean existsByLeaveTypeId(Long leaveTypeId);

}