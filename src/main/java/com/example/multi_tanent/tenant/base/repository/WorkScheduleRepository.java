package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
