package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripCharges;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface TripChargesRepository extends JpaRepository<TripCharges, Long> {
    Optional<TripCharges> findByTrip(Trip trip);
    Optional<TripCharges> findByTripId(Long tripId);

    @Query("SELECT SUM(tc.driverCommission) FROM TripCharges tc WHERE tc.trip.tenant.id = :tenantId AND tc.trip.tripDate >= :startDate AND tc.trip.tripDate <= :endDate")
    java.math.BigDecimal sumDriverCommissionByTenantAndDateRange(@Param("tenantId") Long tenantId, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
}
