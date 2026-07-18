package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProcessSemiFinishedDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcessSemiFinishedDetailRepository extends JpaRepository<ProcessSemiFinishedDetail, Long> {
    List<ProcessSemiFinishedDetail> findByTenantId(Long tenantId);
}
