package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccCashFlowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccCashFlowTransactionRepository extends JpaRepository<AccCashFlowTransaction, Long> {
    List<AccCashFlowTransaction> findByTenantId(String tenantId);
    List<AccCashFlowTransaction> findByPaymentId(Long paymentId);
}
