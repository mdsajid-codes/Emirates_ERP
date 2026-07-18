package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.WorkScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkScheduleDayRepository extends JpaRepository<WorkScheduleDay, Long> {
}
