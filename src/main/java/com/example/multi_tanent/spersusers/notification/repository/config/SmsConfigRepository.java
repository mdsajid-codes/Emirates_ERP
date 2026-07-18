package com.example.multi_tanent.spersusers.notification.repository.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.config.SmsConfig;

import java.util.Optional;

@Repository
public interface SmsConfigRepository extends JpaRepository<SmsConfig, Long> {
    Optional<SmsConfig> findByTenantId(Long tenantId);
}
