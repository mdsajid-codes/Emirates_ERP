package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.PlanFeatureRequest;
import com.example.multi_tanent.pos.entity.PlanFeature;
import com.example.multi_tanent.pos.service.PlanFeatureService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/plans/{planId}/features")
@CrossOrigin(origins = "*")
public class PlanFeatureController {

    private final PlanFeatureService planFeatureService;

    public PlanFeatureController(PlanFeatureService planFeatureService) {
        this.planFeatureService = planFeatureService;
    }

    @PostMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<PlanFeature> addFeatureToPlan(@PathVariable Long planId, @Valid @RequestBody PlanFeatureRequest request) {
        PlanFeature createdFeature = planFeatureService.addFeature(planId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/pos/plans/{planId}/features/{featureId}").buildAndExpand(planId, createdFeature.getId()).toUri();
        return ResponseEntity.created(location).body(createdFeature);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PlanFeature>> getFeaturesForPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(planFeatureService.getFeaturesForPlan(planId));
    }

    @PutMapping("/{featureId}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<PlanFeature> updateFeature(@PathVariable Long planId, @PathVariable Long featureId, @Valid @RequestBody PlanFeatureRequest request) {
        return ResponseEntity.ok(planFeatureService.updateFeature(planId, featureId, request));
    }

    @DeleteMapping("/{featureId}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteFeature(@PathVariable Long planId, @PathVariable Long featureId) {
        planFeatureService.deleteFeature(planId, featureId);
        return ResponseEntity.noContent().build();
    }
}
