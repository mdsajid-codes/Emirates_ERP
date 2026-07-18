package com.example.multi_tanent.spersusers.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.NotificationSubscription;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationSubscriptionRepository extends JpaRepository<NotificationSubscription, Long> {
    Optional<NotificationSubscription> findByTenantIdAndUserIdAndChannel(
            Long tenantId, Long userId, String channel);

    List<NotificationSubscription> findByUserIdAndSubscribedTrue(Long userId);
}
