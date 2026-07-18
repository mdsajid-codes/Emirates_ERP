package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.PurchaseOrderItem;
import java.util.Optional;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    Optional<PurchaseOrderItem> findByIdAndPurchaseOrderId(Long itemId, Long purchaseOrderId);
}
