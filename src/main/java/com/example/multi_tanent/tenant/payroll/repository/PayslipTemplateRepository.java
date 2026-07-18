package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.PayslipTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayslipTemplateRepository extends JpaRepository<PayslipTemplate, Long> {

    List<PayslipTemplate> findByTenantIdOrderByNameAsc(Long tenantId);

    Optional<PayslipTemplate> findByTenantIdAndIsDefaultTrue(Long tenantId);

    Optional<PayslipTemplate> findByTenantIdAndId(Long tenantId, Long id);
}