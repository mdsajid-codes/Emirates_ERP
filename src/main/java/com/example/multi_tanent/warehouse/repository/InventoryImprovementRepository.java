package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryImprovementRepository extends JpaRepository<InventoryImprovement, Long> {
    List<InventoryImprovement> findByEnterpriseId(Long enterpriseId);

    Optional<InventoryImprovement> findByIdAndEnterpriseId(Long id, Long enterpriseId);

    Optional<InventoryImprovement> findByMovementNoAndEnterpriseId(String movementNo, Long enterpriseId);

    List<InventoryImprovement> findByWarehouseIdAndEnterpriseId(Long warehouseId, Long enterpriseId);

    List<InventoryImprovement> findByProductIdAndEnterpriseId(Long productId, Long enterpriseId);

    java.util.List<InventoryImprovement> findByProductIdAndEnterpriseIdAndMovementAtBetween(
            Long productId, Long enterpriseId, java.time.LocalDateTime from, java.time.LocalDateTime to);

    List<InventoryImprovement> findByStatusAndEnterpriseId(com.example.multi_tanent.warehouse.enums.StockStatus status,
            Long enterpriseId);

    List<InventoryImprovement> findByTypeAndEnterpriseId(com.example.multi_tanent.warehouse.enums.MovementType type,
            Long enterpriseId);
}
