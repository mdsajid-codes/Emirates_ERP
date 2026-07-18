package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.EmployeeBiometricMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeBiometricMappingRepository extends JpaRepository<EmployeeBiometricMapping, Long> {
    List<EmployeeBiometricMapping> findByEmployeeEmployeeCode(String employeeCode);
    List<EmployeeBiometricMapping> findByDevice_Id(Long deviceId);
    Optional<EmployeeBiometricMapping> findByBiometricIdentifierAndDevice_Id(String biometricIdentifier, Long deviceId);
}