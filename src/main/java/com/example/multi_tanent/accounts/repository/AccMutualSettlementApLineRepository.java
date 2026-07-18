package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccMutualSettlementApLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccMutualSettlementApLineRepository extends JpaRepository<AccMutualSettlementApLine, Long> {
    List<AccMutualSettlementApLine> findBySettlementId(Long settlementId);
}
