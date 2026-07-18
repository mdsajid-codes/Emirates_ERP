package com.example.multi_tanent.spersusers.notification.repository.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.config.PushConfig;

import java.util.Optional;

@Repository
public interface PushConfigRepository extends JpaRepository<PushConfig, Long> {
    Optional<PushConfig> findByTenantId(Long tenantId);
}
