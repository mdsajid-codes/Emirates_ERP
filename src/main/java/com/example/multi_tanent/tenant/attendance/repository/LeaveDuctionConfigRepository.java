package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.LeaveDeductionConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveDuctionConfigRepository extends JpaRepository<LeaveDeductionConfig, Long> {
    
}