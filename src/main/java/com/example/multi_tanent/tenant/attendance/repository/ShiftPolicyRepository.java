package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.ShiftPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShiftPolicyRepository extends JpaRepository<ShiftPolicy, Long> {
    Optional<ShiftPolicy> findByPolicyName(String policyName);
    Optional<ShiftPolicy> findByIsDefaultTrue();
}