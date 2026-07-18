package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.PlanRequest;
import com.example.multi_tanent.pos.entity.Plan;
import com.example.multi_tanent.pos.entity.PlanFeature;
import com.example.multi_tanent.pos.repository.PlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public Plan createPlan(PlanRequest request) {
        Plan plan = new Plan();
        mapRequestToEntity(request, plan);
        return planRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Plan> getPlanById(Long id) {
        return planRepository.findById(id);
    }

    public Plan updatePlan(Long id, PlanRequest request) {
        Plan plan = getPlanById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));

        plan.getFeatures().clear();
        mapRequestToEntity(request, plan);

        return planRepository.save(plan);
    }

    public void deletePlan(Long id) {
        Plan plan = getPlanById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
        planRepository.delete(plan);
    }

    private void mapRequestToEntity(PlanRequest request, Plan plan) {
        plan.setCode(request.getCode());
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setPriceCents(request.getPriceCents());
        plan.setCurrency(request.getCurrency());
        plan.setBillingInterval(request.getBillingInterval());
        plan.setTrialDays(request.getTrialDays());
        plan.setActive(request.isActive());

        if (request.getFeatures() != null) {
            List<PlanFeature> features = request.getFeatures().stream().map(featureRequest -> PlanFeature.builder().plan(plan).featureKey(featureRequest.getFeatureKey()).value(featureRequest.getValue()).meta(featureRequest.getMeta()).build()).collect(Collectors.toList());
            plan.getFeatures().addAll(features);
        }
    }
}