package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AttendancePolicyRepository extends JpaRepository<AttendancePolicy, Long> {
    Optional<AttendancePolicy> findByPolicyName(String policyName);

    @Query("SELECT p FROM AttendancePolicy p LEFT JOIN FETCH p.shiftPolicy LEFT JOIN FETCH p.capturingPolicy LEFT JOIN FETCH p.leaveDeductionConfig")
    List<AttendancePolicy> findAllWithDetails();
    Optional<AttendancePolicy> findByIsDefaultTrue();
}