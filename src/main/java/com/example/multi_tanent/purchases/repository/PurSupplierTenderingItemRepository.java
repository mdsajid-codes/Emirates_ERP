package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurSupplierTenderingItem;

import java.util.List;

public interface PurSupplierTenderingItemRepository extends JpaRepository<PurSupplierTenderingItem, Long> {
    List<PurSupplierTenderingItem> findByTenderingId(Long tenderingId);
}
