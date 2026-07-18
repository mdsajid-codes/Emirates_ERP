package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByStoreIdAndProductVariantId(Long storeId, Long productVariantId);
    List<Inventory> findByStoreId(Long storeId);
    List<Inventory> findByProductVariantId(Long productVariantId);

    /**
     * Deletes all inventory records associated with a given list of product variant IDs.
     * This is used to clean up inventory before deleting a product.
     * @param productVariantIds A list of product variant IDs.
     */
    void deleteByProductVariantIdIn(List<Long> productVariantIds);
}