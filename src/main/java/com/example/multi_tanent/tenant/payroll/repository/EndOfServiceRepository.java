package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.EndOfService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EndOfServiceRepository extends JpaRepository<EndOfService, Long> {
    Optional<EndOfService> findByEmployeeId(Long employeeId);
    Optional<EndOfService> findByEmployeeIdAndIsPaid(Long employeeId, Boolean isPaid);
}