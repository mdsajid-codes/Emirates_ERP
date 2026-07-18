package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TripPaymentRepository extends JpaRepository<TripPayment, Long> {
    Optional<TripPayment> findByTrip(Trip trip);
    Optional<TripPayment> findByTripId(Long tripId);
}
