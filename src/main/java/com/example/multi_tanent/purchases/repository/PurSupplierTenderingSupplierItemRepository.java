package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurSupplierTenderingSupplierItem;

import java.util.List;

public interface PurSupplierTenderingSupplierItemRepository extends JpaRepository<PurSupplierTenderingSupplierItem, Long> {
    List<PurSupplierTenderingSupplierItem> findByTenderingSupplierId(Long supplierId);
    List<PurSupplierTenderingSupplierItem> findByTenderingItemId(Long itemId);
}
