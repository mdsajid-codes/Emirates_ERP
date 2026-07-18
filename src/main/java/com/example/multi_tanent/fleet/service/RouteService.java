package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.RouteRequest;
import com.example.multi_tanent.fleet.dtos.RouteResponse;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Route;
import com.example.multi_tanent.fleet.entity.RouteStop;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.RouteRepository;
import com.example.multi_tanent.fleet.repository.RouteStopRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import com.example.multi_tanent.sales.entity.DeliveryOrder;
import com.example.multi_tanent.sales.repository.DeliveryOrderRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final RouteStopRepository stopRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository deliveryRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public RouteResponse createRoute(RouteRequest request, Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findByIdAndEnterpriseId(request.getDriverId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        }

        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getVehicleId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        }

        Route route = Route.builder()
                .routeName(request.getRouteName())
                .driver(driver)
                .vehicle(vehicle)
                .routeDate(request.getRouteDate() != null ? request.getRouteDate() : LocalDate.now())
                .status(request.getStatus() != null ? request.getStatus() : "PLANNED")
                .totalDistanceKm(request.getTotalDistanceKm())
                .estimatedDurationMins(request.getEstimatedDurationMins())
                .enterprise(tenant)
                .build();

        final Route savedRoute = routeRepository.save(route);

        if (request.getStops() != null) {
            List<RouteStop> stops = request.getStops().stream().map(s -> {
                DeliveryOrder doOrder = null;
                if (s.getDeliveryOrderId() != null) {
                    doOrder = deliveryRepository.findByIdAndTenantId(s.getDeliveryOrderId(), tenantId).orElse(null);
                }
                return RouteStop.builder()
                        .route(savedRoute)
                        .deliveryOrder(doOrder)
                        .stopOrder(s.getStopOrder())
                        .customerName(s.getCustomerName())
                        .address(s.getAddress())
                        .latitude(s.getLatitude())
                        .longitude(s.getLongitude())
                        .estimatedArrival(s.getEstimatedArrival())
                        .status("PENDING")
                        .build();
            }).collect(Collectors.toList());

            stopRepository.saveAll(stops);
            savedRoute.setStops(stops);
        }

        return mapToResponse(savedRoute);
    }

    @Transactional(readOnly = true)
    public List<RouteResponse> getRoutes(Long tenantId) {
        return routeRepository.findByEnterpriseId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<RouteResponse> listRoutes(Long tenantId, String search, Pageable pageable) {
        String query = null;
        if (search != null && !search.trim().isEmpty()) {
            query = "%" + search.trim().toLowerCase() + "%";
        }
        return routeRepository.findAllFiltered(tenantId, query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public RouteResponse getRouteDetails(Long routeId, Long tenantId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        
        if (!tenantId.equals(route.getEnterprise().getId())) {
             throw new IllegalArgumentException("Unauthorized access to route");
        }

        return mapToResponse(route);
    }

    @Transactional
    public void updateStopStatus(Long stopId, String status) {
        RouteStop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Stop not found"));
        
        stop.setStatus(status);
        if ("ARRIVED".equals(status)) {
            stop.setActualArrival(LocalDateTime.now());
        }
        stopRepository.save(stop);
    }

    private RouteResponse mapToResponse(Route r) {
        List<RouteResponse.RouteStopResponse> stops = stopRepository.findByRouteIdOrderByStopOrderAsc(r.getId()).stream()
                .map(s -> RouteResponse.RouteStopResponse.builder()
                        .id(s.getId())
                        .deliveryOrderId(s.getDeliveryOrder() != null ? s.getDeliveryOrder().getId() : null)
                        .deliveryOrderNumber(s.getDeliveryOrder() != null ? s.getDeliveryOrder().getDeliveryOrderNumber() : "N/A")
                        .stopOrder(s.getStopOrder())
                        .customerName(s.getCustomerName())
                        .address(s.getAddress())
                        .latitude(s.getLatitude())
                        .longitude(s.getLongitude())
                        .estimatedArrival(s.getEstimatedArrival())
                        .actualArrival(s.getActualArrival())
                        .status(s.getStatus())
                        .notes(s.getNotes())
                        .build())
                .collect(Collectors.toList());

        return RouteResponse.builder()
                .id(r.getId())
                .routeName(r.getRouteName())
                .driverId(r.getDriver() != null ? r.getDriver().getId() : null)
                .driverName(r.getDriver() != null ? r.getDriver().getName() : "N/A")
                .vehicleId(r.getVehicle() != null ? r.getVehicle().getId() : null)
                .vehiclePlateNumber(r.getVehicle() != null ? r.getVehicle().getPlateNumber() : "N/A")
                .routeDate(r.getRouteDate())
                .status(r.getStatus())
                .fromLocation(!stops.isEmpty() ? stops.get(0).getAddress() : null)
                .toLocation(!stops.isEmpty() ? stops.get(stops.size() - 1).getAddress() : null)
                .totalDistanceKm(r.getTotalDistanceKm())
                .estimatedDurationMins(r.getEstimatedDurationMins())
                .stops(stops)
                .build();
    }
}
