package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.entity.TenantRequest;
import com.example.multi_tanent.master.repository.TenantRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/master/tenant-requests")
@CrossOrigin(origins = "*")
public class TenantRequestController {

    private final TenantRequestRepository tenantRequestRepository;

    public TenantRequestController(TenantRequestRepository tenantRequestRepository) {
        this.tenantRequestRepository = tenantRequestRepository;
    }

    /**
     * Creates a new tenant request. This endpoint is typically public, allowing potential customers to request a new tenant.
     * Note: The request includes a plain-text password. In a production environment, this is a security risk.
     * The password is stored as-is in the database until the tenant is provisioned. Consider a more secure flow,
     * such as an invitation link for the admin to set their own password.
     *
     * @param tenantRequest The details of the tenant request.
     * @return A response entity with the created tenant request and a location header.
     */
    @PostMapping("/register")
    public ResponseEntity<TenantRequest> createTenantRequest(@RequestBody TenantRequest tenantRequest) {
        TenantRequest savedRequest = tenantRequestRepository.save(tenantRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedRequest.getId()).toUri();
        return ResponseEntity.created(location).body(savedRequest);
    }

    @GetMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public List<TenantRequest> getAllTenantRequests() {
        return tenantRequestRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantRequest> getTenantRequestById(@PathVariable Long id) {
        return tenantRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantRequest> updateTenantRequest(@PathVariable Long id, @RequestBody TenantRequest requestDetails) {
        return tenantRequestRepository.findById(id)
                .map(existingRequest -> {
                    existingRequest.setTenantId(requestDetails.getTenantId());
                    existingRequest.setCompanyName(requestDetails.getCompanyName());
                    existingRequest.setAdminEmail(requestDetails.getAdminEmail());
                    existingRequest.setAdminPassword(requestDetails.getAdminPassword()); // Note security risk
                    existingRequest.setServiceModules(requestDetails.getServiceModules());
                    TenantRequest updatedRequest = tenantRequestRepository.save(existingRequest);
                    return ResponseEntity.ok(updatedRequest);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteTenantRequest(@PathVariable Long id) {
        return tenantRequestRepository.findById(id).map(request -> {
            tenantRequestRepository.delete(request);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
