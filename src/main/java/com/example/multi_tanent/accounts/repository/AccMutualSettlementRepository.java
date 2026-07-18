package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccMutualSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccMutualSettlementRepository extends JpaRepository<AccMutualSettlement, Long> {
    List<AccMutualSettlement> findByTenantId(String tenantId);
    Long countByTenantIdAndSettlementNumberStartingWith(String tenantId, String prefix);
}
