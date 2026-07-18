package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmKpiEmployee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CrmKpiEmployeeRepository extends JpaRepository<CrmKpiEmployee, Long> {
    List<CrmKpiEmployee> findByKpiId(Long kpiId);
}