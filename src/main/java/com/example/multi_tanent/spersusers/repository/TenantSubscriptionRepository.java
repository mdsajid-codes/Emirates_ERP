package com.example.multi_tanent.spersusers.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.TenantSubscription;
import java.util.Optional;

public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, Long> {
    // A tenant should only have one active subscription record in its own DB
    Optional<TenantSubscription> findByTenantId(Long tenantId);
}
