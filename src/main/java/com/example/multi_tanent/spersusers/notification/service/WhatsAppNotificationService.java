package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.WhatsAppConfig;
import com.example.multi_tanent.spersusers.notification.dto.NotificationLogResponse;
import com.example.multi_tanent.spersusers.notification.dto.WhatsAppConfigDto;
import com.example.multi_tanent.spersusers.notification.enums.WhatsAppProvider;
import com.example.multi_tanent.spersusers.notification.repository.config.WhatsAppConfigRepository;
import com.example.multi_tanent.spersusers.notification.repository.log.WhatsAppLogRepository;
import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class WhatsAppNotificationService {

        private final TenantService tenantService;
        private final WhatsAppConfigRepository whatsappConfigRepository;
        private final WhatsAppLogRepository whatsappLogRepository;
        private final NotificationService notificationService;

        private Tenant getCurrentTenant() {
                return tenantService.getCurrentTenant()
                                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
        }

        public WhatsAppConfigDto getWhatsAppConfig() {
                Tenant tenant = getCurrentTenant();
                return whatsappConfigRepository.findByTenantId(tenant.getId())
                                .map(c -> WhatsAppConfigDto.builder()
                                                .enabled(c.getEnabled())
                                                .provider(c.getProvider() != null ? c.getProvider().name() : null)
                                                .apiKey(c.getApiKey())
                                                .phoneNumberId(c.getPhoneNumberId())
                                                .wabaId(c.getWabaId())
                                                .build())
                                .orElse(new WhatsAppConfigDto());
        }

        public void saveWhatsAppConfig(WhatsAppConfigDto dto) {
                Tenant tenant = getCurrentTenant();
                WhatsAppConfig config = whatsappConfigRepository.findByTenantId(tenant.getId())
                                .orElse(WhatsAppConfig.builder().tenant(tenant).build());
                config.setEnabled(dto.getEnabled());
                if (dto.getProvider() != null)
                        config.setProvider(WhatsAppProvider.valueOf(dto.getProvider()));
                config.setApiKey(dto.getApiKey());
                config.setPhoneNumberId(dto.getPhoneNumberId());
                config.setWabaId(dto.getWabaId());
                whatsappConfigRepository.save(config);
        }

        public Page<NotificationLogResponse> getWhatsAppLogs(Pageable pageable) {
                Tenant tenant = getCurrentTenant();
                return whatsappLogRepository.findByTenantId(tenant.getId(), pageable)
                                .map(log -> NotificationLogResponse.builder()
                                                .id(log.getId())
                                                .recipient(log.getRecipient())
                                                .body(log.getBody())
                                                .templateId(log.getTemplateId())
                                                .status(log.getStatus())
                                                .errorMessage(log.getErrorMessage())
                                                .providerMessageId(log.getProviderMessageId())
                                                .sentAt(log.getSentAt())
                                                .build());
        }

        public void sendTestMessage(String recipient, String templateId) {
                Tenant tenant = getCurrentTenant();
                NotificationRequest request = NotificationRequest.builder()
                                .tenantId(tenant.getId())
                                .recipient(recipient)
                                .templateId(templateId)
                                .channels(Set.of("WHATSAPP"))
                                .build();
                notificationService.sendNotification(request);
        }
}
