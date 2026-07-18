// com/example/multi_tanent/master/controller/TenantProvisioningController.java
package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.config.TenantRegistry;
import com.example.multi_tanent.master.dto.ProvisionTenantRequest;
import com.example.multi_tanent.master.dto.SubscriptionDetailsResponse;
import com.example.multi_tanent.master.dto.UpdateTenantServicesRequest;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.master.service.TenantProvisioningService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/master/tenants")
@CrossOrigin(origins = "*")
public class TenantProvisioningController {

    private final TenantProvisioningService service;
    private final MasterTenantRepository masterTenantRepository;
    private final TenantRegistry tenantRegistry;

    public TenantProvisioningController(TenantProvisioningService service, MasterTenantRepository masterTenantRepository, TenantRegistry tenantRegistry) {
        this.service = service;
        this.masterTenantRepository = masterTenantRepository;
        this.tenantRegistry = tenantRegistry;
    }

    @PostMapping("/provision")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public String provision(@Valid @RequestBody ProvisionTenantRequest req) {
        service.provision(req);
        return "tenant created & admin initialized";
    }

    @PutMapping("/{tenantId}/services")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<String> updateTenantServices(
            @PathVariable String tenantId,
            @Valid @RequestBody UpdateTenantServicesRequest req) {

        MasterTenant tenant = masterTenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + tenantId));

        tenant.setServiceModules(req.serviceModules());
        MasterTenant updatedTenant = masterTenantRepository.save(tenant);

        // This will trigger the schema update for the tenant's database
        tenantRegistry.addOrUpdateTenant(updatedTenant);

        // Update the admin roles in the tenant's database
        service.updateAdminRoles(updatedTenant, req.adminRoles());

        return ResponseEntity.ok("Tenant services updated successfully. Schema migration initiated.");
    }

    @GetMapping("/{tenantId}/subscription")
    @PreAuthorize("hasAnyRole('MASTER_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<SubscriptionDetailsResponse> getSubscriptionDetails(@PathVariable String tenantId) {
        return masterTenantRepository.findByTenantId(tenantId)
                .map(tenant -> ResponseEntity.ok(SubscriptionDetailsResponse.fromEntity(tenant)))
                .orElse(ResponseEntity.notFound().build());
    }
}
