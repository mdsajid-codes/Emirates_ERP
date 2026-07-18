package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.PlanFeatureRequest;
import com.example.multi_tanent.pos.entity.Plan;
import com.example.multi_tanent.pos.entity.PlanFeature;
import com.example.multi_tanent.pos.repository.PlanFeatureRepository;
import com.example.multi_tanent.pos.repository.PlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional("tenantTx")
public class PlanFeatureService {

    private final PlanRepository planRepository;
    private final PlanFeatureRepository planFeatureRepository;

    public PlanFeatureService(PlanRepository planRepository, PlanFeatureRepository planFeatureRepository) {
        this.planRepository = planRepository;
        this.planFeatureRepository = planFeatureRepository;
    }

    private Plan getPlan(Long planId) {
        return planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
    }

    public PlanFeature addFeature(Long planId, PlanFeatureRequest request) {
        Plan plan = getPlan(planId);

        PlanFeature feature = PlanFeature.builder()
                .plan(plan)
                .featureKey(request.getFeatureKey())
                .value(request.getValue())
                .meta(request.getMeta())
                .build();

        return planFeatureRepository.save(feature);
    }

    @Transactional(readOnly = true)
    public List<PlanFeature> getFeaturesForPlan(Long planId) {
        Plan plan = getPlan(planId);
        return plan.getFeatures();
    }

    public PlanFeature updateFeature(Long planId, Long featureId, PlanFeatureRequest request) {
        getPlan(planId); // Ensure plan exists

        PlanFeature feature = planFeatureRepository.findByIdAndPlanId(featureId, planId)
                .orElseThrow(() -> new RuntimeException("PlanFeature not found with id: " + featureId + " for plan " + planId));

        feature.setFeatureKey(request.getFeatureKey());
        feature.setValue(request.getValue());
        feature.setMeta(request.getMeta());

        return planFeatureRepository.save(feature);
    }

    public void deleteFeature(Long planId, Long featureId) {
        getPlan(planId); // Ensure plan exists

        PlanFeature feature = planFeatureRepository.findByIdAndPlanId(featureId, planId)
                .orElseThrow(() -> new RuntimeException("PlanFeature not found with id: " + featureId + " for plan " + planId));

        planFeatureRepository.delete(feature);
    }
}