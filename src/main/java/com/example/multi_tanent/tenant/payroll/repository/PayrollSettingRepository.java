package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.PayrollSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollSettingRepository extends JpaRepository<PayrollSetting, Long> {
}