package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
    Optional<PayrollRun> findByYearAndMonth(int year, int month);
}