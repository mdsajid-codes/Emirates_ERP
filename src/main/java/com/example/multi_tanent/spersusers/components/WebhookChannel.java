package com.example.multi_tanent.spersusers.components;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.notification.entity.WebhookEndpoint;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.notification.repository.WebhookEndpointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebhookChannel implements NotificationChannel {

    private final WebhookEndpointRepository webhookEndpointRepository;

    @Override
    public void send(NotificationRequest request) {
        log.info("Dispatching WEBHOOKS for Tenant {}", request.getTenantId());

        try {
            List<WebhookEndpoint> endpoints;

            if (StringUtils.hasText(request.getTemplateId())) {
                // Fetch endpoints specific to this template OR global endpoints
                endpoints = webhookEndpointRepository.findByTenantIdAndTemplateIdAndActiveTrue(
                        request.getTenantId(), request.getTemplateId());
            } else {
                endpoints = webhookEndpointRepository.findByTenantIdAndActiveTrue(request.getTenantId());
            }

            for (WebhookEndpoint endpoint : endpoints) {
                log.info("POSTing to webhook: {} for template: {}", endpoint.getUrl(), request.getTemplateId());
                // Integration logic here
            }
        } catch (Exception e) {
            log.warn("Webhook dispatch failed: {}", e.getMessage());
        }
    }

    @Override
    public String getChannelName() {
        return "WEBHOOK";
    }
}
