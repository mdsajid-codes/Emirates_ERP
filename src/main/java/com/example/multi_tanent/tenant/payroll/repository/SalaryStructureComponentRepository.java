package com.example.multi_tanent.tenant.payroll.repository;

import com.example.multi_tanent.tenant.payroll.entity.SalaryStructureComponent;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryStructureComponentRepository extends JpaRepository<SalaryStructureComponent, Long> {
    boolean existsBySalaryComponentId(Long salaryComponentId);

    List<SalaryStructureComponent> findBySalaryStructureId(Long structureId);
}