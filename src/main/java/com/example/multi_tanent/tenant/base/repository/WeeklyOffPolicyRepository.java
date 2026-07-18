package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.WeeklyOffPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeeklyOffPolicyRepository extends JpaRepository<WeeklyOffPolicy, Long> {
    Optional<WeeklyOffPolicy> findByCode(String code);
    Optional<WeeklyOffPolicy> findByName(String name);
}