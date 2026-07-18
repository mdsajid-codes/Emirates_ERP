package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.AttendanceCapturingPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AttendanceCapturingPolicyRepository extends JpaRepository<AttendanceCapturingPolicy, Long> {
    Optional<AttendanceCapturingPolicy> findByPolicyName(String policyName);
}