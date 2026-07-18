package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.entity.Plan;
import com.example.multi_tanent.pos.entity.TenantSubscription;
import com.example.multi_tanent.pos.repository.PlanRepository;
import com.example.multi_tanent.spersusers.dto.TenantSubscriptionRequest;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.TenantSubscriptionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class TenantSubscriptionService {

    private final TenantSubscriptionRepository subscriptionRepository;
    private final TenantRepository tenantRepository;
    private final PlanRepository planRepository;

    public TenantSubscriptionService(TenantSubscriptionRepository subscriptionRepository, TenantRepository tenantRepository, PlanRepository planRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public TenantSubscription createSubscription(TenantSubscriptionRequest request) {
        Tenant currentTenant = getCurrentTenant();

        subscriptionRepository.findByTenantId(currentTenant.getId()).ifPresent(s -> {
            throw new IllegalStateException("Tenant already has an active subscription.");
        });

        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + request.getPlanId()));

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime periodEnd;
        if ("MONTH".equalsIgnoreCase(plan.getBillingInterval())) {
            periodEnd = now.plusMonths(1);
        } else if ("YEAR".equalsIgnoreCase(plan.getBillingInterval())) {
            periodEnd = now.plusYears(1);
        } else {
            throw new IllegalArgumentException("Unsupported billing interval: " + plan.getBillingInterval());
        }

        TenantSubscription subscription = new TenantSubscription();
        subscription.setTenant(currentTenant);
        subscription.setPlan(plan);
        subscription.setStatus(plan.getTrialDays() > 0 ? "trialing" : "active");
        subscription.setStartedAt(now);
        subscription.setCurrentPeriodStart(now);
        subscription.setCurrentPeriodEnd(plan.getTrialDays() > 0 ? now.plusDays(plan.getTrialDays()) : periodEnd);
        subscription.setNextBillingAt(subscription.getCurrentPeriodEnd());
        subscription.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1L);

        return subscriptionRepository.save(subscription);
    }

    @Transactional(readOnly = true)
    public Optional<TenantSubscription> getCurrentSubscriptionForTenant() {
        Tenant currentTenant = getCurrentTenant();
        return subscriptionRepository.findByTenantId(currentTenant.getId());
    }

    public TenantSubscription cancelSubscription(Long id) {
        TenantSubscription subscription = getCurrentSubscriptionForTenant().filter(s -> s.getId().equals(id)).orElseThrow(() -> new RuntimeException("Subscription not found with id: " + id));
        subscription.setCancelAtPeriodEnd(true);
        return subscriptionRepository.save(subscription);
    }

    public TenantSubscription reactivateSubscription(Long id) {
        TenantSubscription subscription = getCurrentSubscriptionForTenant().filter(s -> s.getId().equals(id)).orElseThrow(() -> new RuntimeException("Subscription not found with id: " + id));
        subscription.setCancelAtPeriodEnd(false);
        return subscriptionRepository.save(subscription);
    }
}