package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.PlanFeature;
import java.util.Optional;

public interface PlanFeatureRepository extends JpaRepository<PlanFeature, Long> {
    Optional<PlanFeature> findByIdAndPlanId(Long featureId, Long planId);
}
