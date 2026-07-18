package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.spersusers.dto.SubscriptionRequest;
import com.example.multi_tanent.spersusers.enitity.Subscription;
import com.example.multi_tanent.spersusers.repository.SubscriptionRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscription")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionController(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<?> createOrUpdateSubscription(@Valid @RequestBody SubscriptionRequest request) {
        Optional<Subscription> existingSubscriptionOpt = subscriptionRepository.findFirstByOrderByIdAsc();

        Subscription subscription;
        boolean isUpdate = existingSubscriptionOpt.isPresent();

        if (isUpdate) {
            subscription = existingSubscriptionOpt.get();
        } else {
            subscription = new Subscription();
        }

        mapRequestToEntity(request, subscription);
        Subscription savedSubscription = subscriptionRepository.save(subscription);

        if (isUpdate) {
            return ResponseEntity.ok(savedSubscription);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubscription);
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Subscription> getSubscription() {
        return subscriptionRepository.findFirstByOrderByIdAsc()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private void mapRequestToEntity(SubscriptionRequest req, Subscription entity) {
        entity.setNumberOfLocations(req.getNumberOfLocations());
        entity.setNumberOfUsers(req.getNumberOfUsers());
        entity.setHrmsAccessCount(req.getHrmsAccessCount());
        entity.setNumberOfStore(req.getNumberOfStore());
        entity.setSubscriptionStartDate(req.getSubscriptionStartDate());
        entity.setSubscriptionEndDate(req.getSubscriptionEndDate());
    }
}
