package com.example.multi_tanent.spersusers.notification.repository.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.config.TelegramConfig;

import java.util.Optional;

@Repository
public interface TelegramConfigRepository extends JpaRepository<TelegramConfig, Long> {
    Optional<TelegramConfig> findByTenantId(Long tenantId);
}
