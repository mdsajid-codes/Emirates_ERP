package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeaveApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveApprovalRepository extends JpaRepository<LeaveApproval, Long> {
    List<LeaveApproval> findByLeaveRequestId(Long leaveRequestId);
}