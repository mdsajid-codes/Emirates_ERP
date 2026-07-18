package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.TripRequest;
import com.example.multi_tanent.fleet.dtos.RouteResponse;
import com.example.multi_tanent.fleet.dtos.TripPaymentUpdateRequest;
import com.example.multi_tanent.fleet.dtos.TripResponse;
import com.example.multi_tanent.fleet.dtos.TripStatusUpdateRequest;
import com.example.multi_tanent.fleet.dtos.VendorPaymentUpdateRequest;
import com.example.multi_tanent.fleet.enums.TripStatus;
import com.example.multi_tanent.fleet.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/fleet/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(tripService.createTrip(request));
    }

    @GetMapping
    @Operation(summary = "List all trips with filtering and pagination")
    public ResponseEntity<Page<TripResponse>> getAllTrips(
            @RequestParam(required = false) TripStatus status,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity
                .ok(tripService.getFilteredTrips(status, driverId, customerId, fromDate, toDate, search, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<TripResponse>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TripResponse> updateStatus(@PathVariable Long id,
            @RequestBody TripStatusUpdateRequest request) {
        return ResponseEntity.ok(tripService.updateStatus(id, request.getNewStatus()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long id, @Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(tripService.updateTrip(id, request));
    }

    @PatchMapping("/{id}/vendor-payment")
    public ResponseEntity<TripResponse> updateVendorPayment(
            @PathVariable Long id,
            @RequestBody @Valid VendorPaymentUpdateRequest request) {
        return ResponseEntity.ok(tripService.updateVendorPayment(id, request));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<TripResponse> updatePayment(@PathVariable Long id,
            @Valid @RequestBody TripPaymentUpdateRequest request) {
        return ResponseEntity.ok(tripService.updatePayment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelTrip(@PathVariable Long id) {
        tripService.cancelTrip(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/stops/{stopId}/reached")
    public ResponseEntity<RouteResponse.RouteStopResponse> markStopReached(
            @PathVariable Long stopId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(tripService.markStopReached(stopId, notes));
    }
}
