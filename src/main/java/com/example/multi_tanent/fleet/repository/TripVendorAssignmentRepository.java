package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripVendorAssignment;
import com.example.multi_tanent.fleet.entity.TripVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TripVendorAssignmentRepository extends JpaRepository<TripVendorAssignment, Long> {
    Optional<TripVendorAssignment> findByTrip(Trip trip);
    Optional<TripVendorAssignment> findByTripId(Long tripId);
    List<TripVendorAssignment> findAllByVendor(TripVendor vendor);

    @Query("SELECT SUM(va.vendorAmount) FROM TripVendorAssignment va WHERE va.trip.tenant.id = :tenantId AND va.trip.tripDate >= :startDate AND va.trip.tripDate <= :endDate")
    java.math.BigDecimal sumVendorAmountByTenantAndDateRange(@Param("tenantId") Long tenantId, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
}
