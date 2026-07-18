package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.PurchaseOrder;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByTenantId(Long tenantId);
    Optional<PurchaseOrder> findByIdAndTenantId(Long id, Long tenantId);
}
