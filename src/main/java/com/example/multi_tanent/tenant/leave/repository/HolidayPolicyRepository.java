package com.example.multi_tanent.tenant.leave.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.base.entity.HolidayPolicy;

import java.util.Optional;

public interface HolidayPolicyRepository extends JpaRepository<HolidayPolicy, Long> {

    Optional<HolidayPolicy> findByName(String name);
}