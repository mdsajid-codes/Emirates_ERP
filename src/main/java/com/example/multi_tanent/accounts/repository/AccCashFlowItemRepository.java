package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccCashFlowItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccCashFlowItemRepository extends JpaRepository<AccCashFlowItem, Long> {
    List<AccCashFlowItem> findByTenantIdOrderByDisplayOrderAsc(String tenantId);
}
