package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.spersusers.dto.LocationRequest;
import com.example.multi_tanent.spersusers.dto.LocationResponse;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class LocationController {

    private final LocationRepository locationRepository;
    private final JpaRepository<Tenant, Long> tenantRepository;
    private final MasterTenantRepository masterTenantRepository;

    public LocationController(LocationRepository locationRepository, JpaRepository<Tenant, Long> tenantRepository, MasterTenantRepository masterTenantRepository) {
        this.locationRepository = locationRepository;
        this.tenantRepository = tenantRepository;
        this.masterTenantRepository = masterTenantRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<?> createLocation(@RequestBody LocationRequest request) {
        String tenantId = TenantContext.getTenantId();
        MasterTenant masterTenant = masterTenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Master tenant record not found. Cannot enforce subscription limits."));

        Integer locationLimit = masterTenant.getNumberOfLocations();
        if (locationLimit != null) {
            long currentLocationCount = locationRepository.count();
            if (currentLocationCount >= locationLimit) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Location limit of " + locationLimit + " has been reached for your subscription.");
            }
        }

        Tenant tenant = tenantRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for the current context."));

        Location location = new Location();
        mapRequestToEntity(request, location);
        location.setTenant(tenant);

        Location savedLocation = locationRepository.save(location);
        URI locationUri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedLocation.getId()).toUri();

        return ResponseEntity.created(locationUri).body(LocationResponse.fromEntity(savedLocation));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LocationResponse>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll().stream()
                .map(LocationResponse::fromEntity)
                .collect(Collectors.toList()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<LocationResponse> updateLocation(@PathVariable Long id, @RequestBody LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + id));
        mapRequestToEntity(request, location);
        return ResponseEntity.ok(LocationResponse.fromEntity(locationRepository.save(location)));
    }

    private void mapRequestToEntity(LocationRequest req, Location entity) {
        entity.setName(req.getName());
        entity.setAddress(req.getAddress());
        entity.setCity(req.getCity());
        entity.setState(req.getState());
        entity.setPostalCode(req.getPostalCode());
        entity.setCountry(req.getCountry());
        entity.setIsPrimary(req.getIsPrimary());
    }
}
