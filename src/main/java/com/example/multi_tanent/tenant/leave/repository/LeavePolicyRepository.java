package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.LeavePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, Long> {
    Optional<LeavePolicy> findByName(String name);
    Optional<LeavePolicy> findByDefaultPolicyTrue();
    @Query("SELECT DISTINCT lp FROM LeavePolicy lp LEFT JOIN FETCH lp.leaveTypePolicies ltp LEFT JOIN FETCH ltp.approvalLevels LEFT JOIN FETCH ltp.leaveType")
    List<LeavePolicy> findAllWithDetails();
}