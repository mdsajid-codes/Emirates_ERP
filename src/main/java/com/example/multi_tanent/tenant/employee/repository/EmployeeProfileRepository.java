package com.example.multi_tanent.tenant.employee.repository;

import com.example.multi_tanent.tenant.employee.entity.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findByEmployeeId(Long employeeId);
}