package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccMutualSettlementArLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccMutualSettlementArLineRepository extends JpaRepository<AccMutualSettlementArLine, Long> {
    List<AccMutualSettlementArLine> findBySettlementId(Long settlementId);
}
