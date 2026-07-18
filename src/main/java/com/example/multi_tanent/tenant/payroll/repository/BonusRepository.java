package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BonusRepository extends JpaRepository<Bonus, Long> {

    List<Bonus> findByPayDateBetween(LocalDate startDate, LocalDate endDate);

    List<Bonus> findByEmployeeIdAndPayDateBetween(Long id, LocalDate payPeriodStart, LocalDate payPeriodEnd);

}