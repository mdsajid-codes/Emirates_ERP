package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.SickLeaveInterval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SickLeaveIntervalRepository extends JpaRepository<SickLeaveInterval, Long> {
    List<SickLeaveInterval> findBySickLeaveTypeId(Long sickLeaveTypeId);
}
