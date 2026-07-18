package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.pos.service.StoreService;
import com.example.multi_tanent.spersusers.dto.StoreRequest;
import com.example.multi_tanent.spersusers.enitity.Store;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/stores")
@CrossOrigin(origins = "*")
public class StoreController {
    private final StoreService storeService;
    private final JpaRepository<Store, Long> storeRepository;
    private final MasterTenantRepository masterTenantRepository;

    public StoreController(StoreService storeService, JpaRepository<Store, Long> storeRepository, MasterTenantRepository masterTenantRepository) {
        this.storeService = storeService;
        this.storeRepository = storeRepository;
        this.masterTenantRepository = masterTenantRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<?> createStore( @RequestBody StoreRequest storeRequest) {
        String tenantId = TenantContext.getTenantId();
        MasterTenant masterTenant = masterTenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Master tenant record not found. Cannot enforce subscription limits."));

        Integer storeLimit = masterTenant.getNumberOfStore();
        if (storeLimit != null) {
            long currentStoreCount = storeRepository.count();
            if (currentStoreCount >= storeLimit) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Store limit of " + storeLimit + " has been reached for your subscription.");
            }
        }

        Store createdStore = storeService.createStore(storeRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdStore.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdStore);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(storeService.getAllStoresForCurrentTenant());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Store> getStoreById(@PathVariable Long id) {
        return storeService.getStoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Store> updateStore(@PathVariable Long id, @RequestBody StoreRequest storeRequest) {
        return ResponseEntity.ok(storeService.updateStore(id, storeRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }
}
