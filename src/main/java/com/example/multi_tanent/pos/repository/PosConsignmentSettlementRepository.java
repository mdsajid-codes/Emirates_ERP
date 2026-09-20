package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.PosConsignmentSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PosConsignmentSettlementRepository extends JpaRepository<PosConsignmentSettlement, Long> {
    List<PosConsignmentSettlement> findByTenantId(String tenantId);
    List<PosConsignmentSettlement> findByTenantIdAndVendorId(String tenantId, Long vendorId);
}
