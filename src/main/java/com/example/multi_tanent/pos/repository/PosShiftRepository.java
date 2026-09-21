package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.PosShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PosShiftRepository extends JpaRepository<PosShift, Long> {
    List<PosShift> findByTenantId(String tenantId);
    Optional<PosShift> findByTenantIdAndCashierUserIdAndStatus(String tenantId, String cashierUserId, String status);
    List<PosShift> findByTenantIdAndStatus(String tenantId, String status);
}
