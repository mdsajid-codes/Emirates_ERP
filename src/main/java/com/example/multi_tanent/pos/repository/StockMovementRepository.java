package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.multi_tanent.pos.entity.StockMovement;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByTenantId(Long tenantId);

    Optional<StockMovement> findByIdAndTenantId(Long id, Long tenantId);

    void deleteByProductIdIn(List<Long> productIds);

    List<StockMovement> findByTenantIdAndReasonContainingIgnoreCaseAndCreatedAtBetween(
            Long tenantId, String reason, OffsetDateTime startDate, OffsetDateTime endDate);

    @Query("SELECT sm FROM StockMovement sm " +
            "JOIN sm.product p " +
            "WHERE sm.tenant.id = :tenantId " +
            "AND sm.createdAt BETWEEN :startDate AND :endDate " +
            "AND (:storeId IS NULL OR sm.store.id = :storeId) " +
            "AND (:itemName IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :itemName, '%')))")
    List<StockMovement> findItemMovements(
            @Param("tenantId") Long tenantId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            @Param("storeId") Long storeId,
            @Param("itemName") String itemName);
}
