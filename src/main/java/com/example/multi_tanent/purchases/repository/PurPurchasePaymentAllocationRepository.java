package com.example.multi_tanent.purchases.repository;

// additional optional repos (useful for lookups)

import com.example.multi_tanent.purchases.entity.PurPurchasePaymentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurPurchasePaymentAllocationRepository extends JpaRepository<PurPurchasePaymentAllocation, Long> {
}
