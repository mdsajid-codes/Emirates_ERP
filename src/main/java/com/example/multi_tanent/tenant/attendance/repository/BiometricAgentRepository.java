package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.BiometricAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BiometricAgentRepository extends JpaRepository<BiometricAgent, Long> {
    Optional<BiometricAgent> findByAgentName(String agentName);
}
