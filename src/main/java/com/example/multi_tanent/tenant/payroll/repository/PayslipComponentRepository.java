package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.PayslipComponent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayslipComponentRepository extends JpaRepository<PayslipComponent, Long> {
    List<PayslipComponent> findByPayslipId(Long payslipId);
}