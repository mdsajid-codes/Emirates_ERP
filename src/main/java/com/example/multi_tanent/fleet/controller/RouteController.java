package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.RouteRequest;
import com.example.multi_tanent.fleet.dtos.RouteResponse;
import com.example.multi_tanent.fleet.service.RouteService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/fleet/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;
    private final TenantRepository tenantRepository;

    @PostMapping
    public ResponseEntity<RouteResponse> createRoute(@RequestBody RouteRequest request) {
        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(routeService.createRoute(request, tenant.getId()));
    }

    @GetMapping
    public ResponseEntity<List<RouteResponse>> getRoutes() {
        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(routeService.getRoutes(tenant.getId()));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<RouteResponse>> listRoutes(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(routeService.listRoutes(tenant.getId(), search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> getRouteDetails(@PathVariable Long id) {
        Tenant tenant = getCurrentTenant();
        return ResponseEntity.ok(routeService.getRouteDetails(id, tenant.getId()));
    }

    @PutMapping("/stops/{stopId}/arrive")
    public ResponseEntity<Void> markArrived(@PathVariable Long stopId) {
        routeService.updateStopStatus(stopId, "ARRIVED");
        return ResponseEntity.ok().build();
    }

    @PutMapping("/stops/{stopId}/complete")
    public ResponseEntity<Void> markCompleted(@PathVariable Long stopId) {
        routeService.updateStopStatus(stopId, "COMPLETED");
        return ResponseEntity.ok().build();
    }

    private Tenant getCurrentTenant() {
        String tenantIdentifier = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Tenant context missing or invalid"));
    }
}
