package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.PosSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PosSettlementRepository extends JpaRepository<PosSettlement, Long> {
    List<PosSettlement> findByTenantId(String tenantId);
}
