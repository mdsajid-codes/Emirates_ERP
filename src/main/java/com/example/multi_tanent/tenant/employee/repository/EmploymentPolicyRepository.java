package com.example.multi_tanent.tenant.employee.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.employee.entity.EmploymentPolicy;

public interface EmploymentPolicyRepository extends JpaRepository<EmploymentPolicy, Long> {
    
}
