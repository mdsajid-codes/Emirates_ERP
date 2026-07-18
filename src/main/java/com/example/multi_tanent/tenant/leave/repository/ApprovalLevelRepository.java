package com.example.multi_tanent.tenant.leave.repository;

import com.example.multi_tanent.tenant.leave.entity.ApprovalLevel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalLevelRepository extends JpaRepository<ApprovalLevel, Long> {
}