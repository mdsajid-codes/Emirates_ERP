package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.entity.TenantSubscription;
import com.example.multi_tanent.pos.service.TenantSubscriptionService;
import com.example.multi_tanent.spersusers.dto.TenantSubscriptionRequest;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/pos/tenant-subscriptions")
@CrossOrigin(origins = "*")
public class TenantSubscriptionController {

    private final TenantSubscriptionService subscriptionService;

    public TenantSubscriptionController(TenantSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantSubscription> createSubscription(@Valid @RequestBody TenantSubscriptionRequest request) {
        TenantSubscription createdSubscription = subscriptionService.createSubscription(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(createdSubscription.getId()).toUri();
        return ResponseEntity.created(location).body(createdSubscription);
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<TenantSubscription> getCurrentSubscription() {
        return subscriptionService.getCurrentSubscriptionForTenant()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantSubscription> cancelSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id));
    }

    @PutMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantSubscription> reactivateSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.reactivateSubscription(id));
    }
}
