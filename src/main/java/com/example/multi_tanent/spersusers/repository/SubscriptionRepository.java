package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // A tenant should only have one subscription record in its own DB
    Optional<Subscription> findFirstByOrderByIdAsc();
}