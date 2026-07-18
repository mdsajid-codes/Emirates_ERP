package com.example.multi_tanent.spersusers.notification.repository.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.config.WhatsAppConfig;

import java.util.Optional;

@Repository
public interface WhatsAppConfigRepository extends JpaRepository<WhatsAppConfig, Long> {
    Optional<WhatsAppConfig> findByTenantId(Long tenantId);
}
