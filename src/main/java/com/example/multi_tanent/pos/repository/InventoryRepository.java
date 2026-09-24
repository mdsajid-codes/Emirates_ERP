package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByStoreIdAndProductId(Long storeId, Long productId);
    List<Inventory> findByStoreId(Long storeId);
    List<Inventory> findByProductId(Long productId);
    void deleteByProductIdIn(List<Long> productIds);
}