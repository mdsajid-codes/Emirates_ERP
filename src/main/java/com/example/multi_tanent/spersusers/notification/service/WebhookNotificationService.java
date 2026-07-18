package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.WebhookEndpoint;
import com.example.multi_tanent.spersusers.notification.dto.WebhookEndpointDto;
import com.example.multi_tanent.spersusers.notification.repository.WebhookEndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class WebhookNotificationService {

    private final TenantService tenantService;
    private final WebhookEndpointRepository webhookEndpointRepository;

    private Tenant getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
    }

    public List<WebhookEndpointDto> getWebhooks() {
        Tenant tenant = getCurrentTenant();
        return webhookEndpointRepository.findAll().stream()
                .filter(w -> w.getTenant().getId().equals(tenant.getId()))
                .map(w -> WebhookEndpointDto.builder()
                        .id(w.getId())
                        .name(w.getName())
                        .url(w.getUrl())
                        .templateId(w.getTemplateId())
                        .secret(w.getSecret())
                        .active(w.getActive())
                        .httpMethod(w.getHttpMethod())
                        .customHeaders(w.getCustomHeaders())
                        .build())
                .toList();
    }

    public void saveWebhook(WebhookEndpointDto dto) {
        Tenant tenant = getCurrentTenant();
        WebhookEndpoint webhook = (dto.getId() != null)
                ? webhookEndpointRepository.findById(dto.getId()).orElseThrow()
                : WebhookEndpoint.builder().tenant(tenant).build();
        webhook.setName(dto.getName());
        webhook.setUrl(dto.getUrl());
        webhook.setTemplateId(dto.getTemplateId());
        webhook.setSecret(dto.getSecret());
        webhook.setActive(dto.getActive());
        webhook.setHttpMethod(dto.getHttpMethod());
        webhook.setCustomHeaders(dto.getCustomHeaders());
        webhookEndpointRepository.save(webhook);
    }

    public void deleteWebhook(Long id) {
        webhookEndpointRepository.deleteById(id);
    }
}
