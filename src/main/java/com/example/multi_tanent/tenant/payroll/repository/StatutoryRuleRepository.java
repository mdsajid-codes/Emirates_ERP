package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.StatutoryRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatutoryRuleRepository extends JpaRepository<StatutoryRule, Long> {
}