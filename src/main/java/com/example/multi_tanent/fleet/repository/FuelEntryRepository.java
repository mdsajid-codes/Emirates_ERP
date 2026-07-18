package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.FuelEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface FuelEntryRepository extends JpaRepository<FuelEntry, Long> {

    @Query("SELECT f FROM FuelEntry f JOIN FETCH f.vehicle LEFT JOIN FETCH f.driver LEFT JOIN FETCH f.trip WHERE f.id = :id")
    Optional<FuelEntry> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT f FROM FuelEntry f LEFT JOIN FETCH f.vehicle LEFT JOIN FETCH f.driver WHERE f.tenant.id = :tenantId")
    Page<FuelEntry> findByTenantIdWithDetails(@Param("tenantId") Long tenantId, Pageable pageable);

    @Query("SELECT f FROM FuelEntry f LEFT JOIN FETCH f.vehicle LEFT JOIN FETCH f.driver " +
           "WHERE f.tenant.id = :tenantId " +
           "AND (:vehicleId IS NULL OR f.vehicle.id = :vehicleId) " +
           "AND (:tripId IS NULL OR (f.trip IS NOT NULL AND f.trip.id = :tripId)) " +
           "AND (:startDate IS NULL OR f.fuelDate >= :startDate) " +
           "AND (:endDate IS NULL OR f.fuelDate <= :endDate) " +
           "AND (:query IS NULL " +
           "     OR LOWER(f.fuelStation) LIKE :query " +
           "     OR LOWER(f.notes) LIKE :query " +
           "     OR LOWER(f.fuelType) LIKE :query)")
    Page<FuelEntry> findByTenantIdAndFiltersWithDetails(
            @Param("tenantId") Long tenantId,
            @Param("vehicleId") Long vehicleId,
            @Param("tripId") Long tripId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("query") String query,
            Pageable pageable);

    @Query("SELECT SUM(f.amountAed) FROM FuelEntry f WHERE f.tenant.id = :tenantId AND f.fuelDate >= :startDate AND f.fuelDate <= :endDate")
    java.math.BigDecimal sumTotalCostByTenantAndDateRange(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
