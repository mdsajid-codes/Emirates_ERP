package com.example.multi_tanent.spersusers.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.WebhookEndpoint;

import java.util.List;

@Repository
public interface WebhookEndpointRepository extends JpaRepository<WebhookEndpoint, Long> {
    List<WebhookEndpoint> findByTenantIdAndActiveTrue(Long tenantId);

    List<WebhookEndpoint> findByTenantIdAndTemplateIdAndActiveTrue(Long tenantId, String templateId);
}
