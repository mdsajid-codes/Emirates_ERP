package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.RouteRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;

import com.example.multi_tanent.fleet.dtos.*;
import com.example.multi_tanent.fleet.entity.*;
import com.example.multi_tanent.fleet.enums.*;
import com.example.multi_tanent.fleet.repository.*;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final TripCustomerRepository customerRepository;
    private final TripVendorRepository vendorRepository;
    private final RouteRepository routeRepository;
    private final DriverRepository driverRepository;
    private final TenantRepository tenantRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteStopRepository stopRepository;
    private final TripStopRepository tripStopRepository;

    private static final Map<TripStatus, Set<TripStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(TripStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(TripStatus.CREATED, Set.of(TripStatus.IN_PROGRESS));
        ALLOWED_TRANSITIONS.put(TripStatus.IN_PROGRESS, Set.of(TripStatus.COMPLETED));
        ALLOWED_TRANSITIONS.put(TripStatus.COMPLETED, Set.of(TripStatus.INVOICED));
        ALLOWED_TRANSITIONS.put(TripStatus.INVOICED, Set.of(TripStatus.PAID));
        ALLOWED_TRANSITIONS.put(TripStatus.PAID, Set.of(TripStatus.CLOSED));
        ALLOWED_TRANSITIONS.put(TripStatus.CLOSED, Set.of());
    }

    @Transactional
    public TripResponse createTrip(TripRequest request) {
        Tenant tenant = getCurrentTenant();

        Trip trip = Trip.builder()
                .tenant(tenant)
                .tripDate(request.getTripDate())
                .tripNo(generateNextTripNo(tenant))
                .tripMonth(request.getTripDate().getMonth().name().substring(0, 3))
                .driver(request.getDriverId() != null ? driverRepository.findById(request.getDriverId()).orElse(null) : null)
                .customer(customerRepository.findById(request.getCustomerId()).orElseThrow())
                .containerNumber(request.getContainerNumber())
                .fromLocation(request.getFromLocation())
                .toLocation(request.getToLocation())
                .contactPerson(request.getContactPerson())
                .customerType(request.getCustomerType())
                .remarks(request.getRemarks())
                .startTime(request.getStartTime())
                .estimatedEndTime(request.getEstimatedEndTime())
                .cargoType(request.getCargoType())
                .loadWeightKg(request.getLoadWeightKg())
                .route(request.getRouteId() != null ? routeRepository.findById(request.getRouteId()).orElse(null)
                        : null)
                .vehicle(
                        request.getVehicleId() != null ? vehicleRepository.findById(request.getVehicleId()).orElse(null)
                                : null)
                .tripStatus(TripStatus.CREATED)
                .build();

        TripCharges charges = TripCharges.builder()
                .trip(trip)
                .amount(request.getAmount())
                .tokenAmount(request.getTokenAmount())
                .otherCharges(request.getOtherCharges())
                .otherChargeType(request.getOtherChargeType())
                .build();

        calculateFinancials(charges);
        trip.setCharges(charges);

        if (request.getVendorId() != null) {
            TripVendorAssignment va = TripVendorAssignment.builder()
                    .trip(trip)
                    .vendor(vendorRepository.findById(request.getVendorId()).orElseThrow())
                    .vendorAmount(request.getVendorAmount())
                    .vendorPaymentStatus(TripPaymentStatus.PENDING)
                    .build();
            trip.setVendorAssignment(va);
        }

        if (request.getTokenAmount() != null && request.getTokenAmount().compareTo(BigDecimal.ZERO) > 0) {
            TripPayment payment = TripPayment.builder()
                    .trip(trip)
                    .receivedBy(request.getReceivedBy())
                    .tokenPaymentMethod(request.getTokenPaymentMethod())
                    .chequeNumber(request.getChequeNumber())
                    .otherReference(request.getOtherReference())
                    .paymentStatus(TripPaymentStatus.PARTIAL)
                    .build();
            trip.setPayment(payment);
        }

        // Clone Route Stops to TripStops for trip-specific tracking
        if (trip.getRoute() != null) {
            List<RouteStop> templateStops = stopRepository.findByRouteIdOrderByStopOrderAsc(trip.getRoute().getId());
            List<TripStop> tripStops = templateStops.stream().map(ts -> TripStop.builder()
                    .trip(trip)
                    .stopOrder(ts.getStopOrder() != null ? ts.getStopOrder() : 0)
                    .customerName(ts.getCustomerName())
                    .address(ts.getAddress())
                    .latitude(ts.getLatitude())
                    .longitude(ts.getLongitude())
                    .status("PENDING")
                    .build()).collect(Collectors.toList());
            trip.setTripStops(tripStops);
            log.info("Cloned {} stops for Trip {}", tripStops.size(), trip.getTripNo());
        }

        Trip savedTrip = tripRepository.save(trip);
        log.info("Trip created: {} for tenant: {}", savedTrip.getTripNo(), tenant.getId());
        return mapToResponse(savedTrip);
    }

    @Transactional(readOnly = true)
    public Page<TripResponse> getFilteredTrips(
            TripStatus status, Long driverId, Long customerId,
            LocalDate fromDate, LocalDate toDate, String search, Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        String query = null;
        if (search != null && !search.trim().isEmpty()) {
            query = "%" + search.trim().toLowerCase() + "%";
        }
        return tripRepository.findAllFiltered(tenant, status, driverId, customerId, fromDate, toDate, query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAllByTenantOrderByTripDateDesc(getCurrentTenant())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public TripResponse updateVendorPayment(Long tripId, VendorPaymentUpdateRequest req) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        TripVendorAssignment va = trip.getVendorAssignment();
        if (va == null) {
            throw new IllegalStateException("Trip has no vendor assignment");
        }

        va.setVendorPaymentStatus(req.getVendorPaymentStatus());
        va.setVendorPaymentDate(req.getVendorPaymentDate());
        va.setVendorNotes(req.getVendorNotes());

        // If vendor PAID + customer PAID -> auto-set trip to CLOSED
        if (va.getVendorPaymentStatus() == TripPaymentStatus.PAID
                && trip.getPayment() != null
                && trip.getPayment().getPaymentStatus() == TripPaymentStatus.PAID) {
            trip.setTripStatus(TripStatus.CLOSED);
        }

        return mapToResponse(tripRepository.save(trip));
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        return tripRepository.findById(id).map(this::mapToResponse).orElseThrow();
    }

    @Transactional
    public TripResponse updateStatus(Long id, TripStatus newStatus) {
        Trip trip = tripRepository.findById(id).orElseThrow();
        log.info("Updating trip status: {} -> {} for trip: {}", trip.getTripStatus(), newStatus, id);
        validateStatusTransition(trip.getTripStatus(), newStatus);
        trip.setTripStatus(newStatus);

        // Auto-update Driver status
        if (trip.getDriver() != null) {
            Driver driver = trip.getDriver();
            if (newStatus == TripStatus.IN_PROGRESS) {
                driver.setStatus(DriverStatus.ON_TRIP);
            } else if (newStatus == TripStatus.COMPLETED || newStatus == TripStatus.CANCELLED) {
                driver.setStatus(DriverStatus.AVAILABLE);
            }
            driverRepository.save(driver);
        }

        // Auto-update Vehicle status
        if (trip.getVehicle() != null) {
            Vehicle vehicle = trip.getVehicle();
            if (newStatus == TripStatus.IN_PROGRESS) {
                vehicle.setVehicleStatus(VehicleStatus.IN_USE);
            } else if (newStatus == TripStatus.COMPLETED || newStatus == TripStatus.CANCELLED) {
                vehicle.setVehicleStatus(VehicleStatus.ACTIVE);
            }
            vehicleRepository.save(vehicle);
        }

        return mapToResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse updateTrip(Long id, TripRequest request) {
        Trip trip = tripRepository.findById(id).orElseThrow();
        trip.setContainerNumber(request.getContainerNumber());
        trip.setFromLocation(request.getFromLocation());
        trip.setToLocation(request.getToLocation());
        trip.setCustomerRefJobNo(request.getCustomerRefJobNo());
        trip.setContactPerson(request.getContactPerson());
        trip.setRemarks(request.getRemarks());
        trip.setStartTime(request.getStartTime());
        trip.setEstimatedEndTime(request.getEstimatedEndTime());
        trip.setCargoType(request.getCargoType());
        trip.setLoadWeightKg(request.getLoadWeightKg());
        trip.setRoute(
                request.getRouteId() != null ? routeRepository.findById(request.getRouteId()).orElse(null) : null);
        trip.setVehicle(request.getVehicleId() != null ? vehicleRepository.findById(request.getVehicleId()).orElse(null)
                : null);

        TripCharges charges = trip.getCharges();
        charges.setAmount(request.getAmount());
        charges.setTokenAmount(request.getTokenAmount());
        charges.setOtherCharges(request.getOtherCharges());
        charges.setOtherChargeType(request.getOtherChargeType());
        calculateFinancials(charges);

        return mapToResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse updatePayment(Long id, TripPaymentUpdateRequest request) {
        Trip trip = tripRepository.findById(id).orElseThrow();
        TripPayment payment = trip.getPayment();
        if (payment == null) {
            payment = TripPayment.builder().trip(trip).build();
            trip.setPayment(payment);
        }
        payment.setPaymentStatus(request.getPaymentStatus());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setReceivedBy(request.getReceivedBy());
        payment.setNotes(request.getNotes());
        return mapToResponse(tripRepository.save(trip));
    }

    @Transactional
    public void cancelTrip(Long id) {
        Trip trip = tripRepository.findById(id).orElseThrow();
        if (trip.getTripStatus() == TripStatus.INVOICED || trip.getTripStatus() == TripStatus.CLOSED) {
            throw new IllegalStateException("Cannot cancel an invoiced or closed trip");
        }
        trip.setTripStatus(TripStatus.CANCELLED);
        tripRepository.save(trip);
    }

    private void calculateFinancials(TripCharges charges) {
        BigDecimal amount = charges.getAmount() != null ? charges.getAmount() : BigDecimal.ZERO;
        BigDecimal other = charges.getOtherCharges() != null ? charges.getOtherCharges() : BigDecimal.ZERO;
        BigDecimal token = charges.getTokenAmount() != null ? charges.getTokenAmount() : BigDecimal.ZERO;

        // UAE VAT Rule: token is 0% VAT, amount + otherCharges are 5% VAT
        BigDecimal vat = amount.add(other).multiply(new BigDecimal("0.05"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = amount.add(vat).add(other).add(token);
        BigDecimal commission = amount.multiply(new BigDecimal("0.10"))
                .setScale(2, RoundingMode.HALF_UP);

        charges.setVatAmount(vat);
        charges.setTotalAmount(total);
        charges.setDriverCommission(commission);
    }

    private int generateNextTripNo(Tenant tenant) {
        return tripRepository.findMaxTripNoByTenant(tenant) + 1;
    }

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId).orElseThrow();
    }

    private void validateStatusTransition(TripStatus current, TripStatus next) {
        Set<TripStatus> allowed = ALLOWED_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(next)) {
            throw new IllegalStateException("Invalid status transition from " + current + " to " + next);
        }
    }

    public TripResponse mapToResponse(Trip t) {
        TripResponse res = TripResponse.builder()
                .id(t.getId())
                .tripNo(t.getTripNo())
                .tripDate(t.getTripDate())
                .tripMonth(t.getTripMonth())
                .tripStatus(t.getTripStatus().name())
                .containerNumber(t.getContainerNumber())
                .fromLocation(t.getFromLocation())
                .toLocation(t.getToLocation())
                .remarks(t.getRemarks())
                .createdAt(t.getCreatedAt())
                .driverId(t.getDriver() != null ? t.getDriver().getId() : null)
                .driverName(t.getDriver() != null ? t.getDriver().getName() : null)
                .customerId(t.getCustomer().getId())
                .customerName(t.getCustomer().getCompanyName())
                .customerRefJobNo(t.getCustomerRefJobNo())
                .contactPerson(t.getContactPerson())
                .startTime(t.getStartTime())
                .estimatedEndTime(t.getEstimatedEndTime())
                .cargoType(t.getCargoType())
                .loadWeightKg(t.getLoadWeightKg())
                .routeId(t.getRoute() != null ? t.getRoute().getId() : null)
                .routeName(t.getRoute() != null ? t.getRoute().getRouteName() : null)
                .vehicleId(t.getVehicle() != null ? t.getVehicle().getId() : null)
                .vehiclePlateNumber(t.getVehicle() != null ? t.getVehicle().getPlateNumber() : null)
                .routeStops(
                        t.getTripStops() != null && !t.getTripStops().isEmpty()
                                ? t.getTripStops().stream()
                                        .sorted(java.util.Comparator.comparing(s -> s.getStopOrder() != null ? s.getStopOrder() : 0))
                                        .map(s -> RouteResponse.RouteStopResponse.builder()
                                                .id(s.getId())
                                                .stopOrder(s.getStopOrder())
                                                .customerName(s.getCustomerName())
                                                .address(s.getAddress())
                                                .status(s.getStatus())
                                                .notes(s.getNotes())
                                                .estimatedArrival(s.getEstimatedArrival())
                                                .actualArrival(s.getActualArrival())
                                                .build())
                                        .collect(Collectors.toList())
                                : (t.getRoute() != null
                                        ? stopRepository.findByRouteIdOrderByStopOrderAsc(t.getRoute().getId()).stream()
                                                .map(s -> RouteResponse.RouteStopResponse.builder()
                                                        .id(s.getId())
                                                        .stopOrder(s.getStopOrder())
                                                        .customerName(s.getCustomerName())
                                                        .address(s.getAddress())
                                                        .status(s.getStatus())
                                                        .notes(s.getNotes())
                                                        .estimatedArrival(s.getEstimatedArrival())
                                                        .actualArrival(s.getActualArrival())
                                                        .build())
                                                .collect(Collectors.toList())
                                        : null))
                .build();

        if (t.getCharges() != null) {
            TripCharges c = t.getCharges();
            res.setAmount(c.getAmount());
            res.setTokenAmount(c.getTokenAmount());
            res.setOtherCharges(c.getOtherCharges());
            res.setOtherChargeType(c.getOtherChargeType() != null ? c.getOtherChargeType().name() : null);
            res.setVatAmount(c.getVatAmount());
            res.setTotalAmount(c.getTotalAmount());
            res.setDriverCommission(c.getDriverCommission());
        }

        if (t.getPayment() != null) {
            res.setPaymentStatus(t.getPayment().getPaymentStatus().name());
            res.setPaymentDate(t.getPayment().getPaymentDate());
            res.setReceivedBy(t.getPayment().getReceivedBy());
        }

        if (t.getVendorAssignment() != null) {
            TripVendorAssignment va = t.getVendorAssignment();
            res.setVendorId(va.getVendor().getId());
            res.setVendorName(va.getVendor().getCompanyName());
            res.setVendorAmount(va.getVendorAmount());
            res.setVendorPaymentStatus(va.getVendorPaymentStatus().name());
        }

        if (t.getInvoice() != null) {
            res.setInvoiceId(t.getInvoice().getId());
            res.setInvoiceNumber(t.getInvoice().getInvoiceNumber());
        }

        return res;
    }

    @Transactional
    public RouteResponse.RouteStopResponse markStopReached(Long stopId, String notes) {
        // 1. Try TripStop first (The new trip-specific model)
        java.util.Optional<TripStop> tripStopOpt = tripStopRepository.findById(stopId);
        if (tripStopOpt.isPresent()) {
            TripStop stop = tripStopOpt.get();
            stop.setStatus("REACHED");
            stop.setActualArrival(LocalDateTime.now());
            stop.setNotes(notes);
            tripStopRepository.save(stop);
            return RouteResponse.RouteStopResponse.builder()
                    .id(stop.getId())
                    .stopOrder(stop.getStopOrder())
                    .customerName(stop.getCustomerName())
                    .address(stop.getAddress())
                    .status(stop.getStatus())
                    .notes(stop.getNotes())
                    .actualArrival(stop.getActualArrival())
                    .build();
        }

        // 2. Fallback to legacy RouteStop
        RouteStop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new EntityNotFoundException("Stop not found: " + stopId));

        stop.setStatus("REACHED");
        stop.setActualArrival(LocalDateTime.now());
        stop.setNotes(notes);
        stopRepository.save(stop);
        return RouteResponse.RouteStopResponse.builder()
                .id(stop.getId())
                .stopOrder(stop.getStopOrder())
                .customerName(stop.getCustomerName())
                .address(stop.getAddress())
                .status(stop.getStatus())
                .notes(stop.getNotes())
                .actualArrival(stop.getActualArrival())
                .build();
    }

    private RouteResponse.RouteStopResponse mapStopToResponse(RouteStop s) {
        return RouteResponse.RouteStopResponse.builder()
                .id(s.getId())
                .stopOrder(s.getStopOrder())
                .customerName(s.getCustomerName())
                .address(s.getAddress())
                .status(s.getStatus())
                .notes(s.getNotes())
                .estimatedArrival(s.getEstimatedArrival())
                .actualArrival(s.getActualArrival())
                .build();
    }
}
