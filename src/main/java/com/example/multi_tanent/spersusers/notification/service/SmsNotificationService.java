package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.SmsConfig;
import com.example.multi_tanent.spersusers.notification.dto.NotificationLogResponse;
import com.example.multi_tanent.spersusers.notification.dto.SmsConfigDto;
import com.example.multi_tanent.spersusers.notification.enums.SmsProvider;
import com.example.multi_tanent.spersusers.notification.repository.config.SmsConfigRepository;
import com.example.multi_tanent.spersusers.notification.repository.log.SmsLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class SmsNotificationService {

        private final TenantService tenantService;
        private final SmsConfigRepository smsConfigRepository;
        private final SmsLogRepository smsLogRepository;

        private Tenant getCurrentTenant() {
                return tenantService.getCurrentTenant()
                                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
        }

        public SmsConfigDto getSmsConfig() {
                Tenant tenant = getCurrentTenant();
                return smsConfigRepository.findByTenantId(tenant.getId())
                                .map(c -> SmsConfigDto.builder()
                                                .enabled(c.getEnabled())
                                                .provider(c.getProvider() != null ? c.getProvider().name() : null)
                                                .apiKey(c.getApiKey())
                                                .apiSecret(c.getApiSecret())
                                                .senderId(c.getSenderId())
                                                .build())
                                .orElse(new SmsConfigDto());
        }

        public void saveSmsConfig(SmsConfigDto dto) {
                Tenant tenant = getCurrentTenant();
                SmsConfig config = smsConfigRepository.findByTenantId(tenant.getId())
                                .orElse(SmsConfig.builder().tenant(tenant).build());
                config.setEnabled(dto.getEnabled());
                if (dto.getProvider() != null)
                        config.setProvider(SmsProvider.valueOf(dto.getProvider()));
                config.setApiKey(dto.getApiKey());
                config.setApiSecret(dto.getApiSecret());
                config.setSenderId(dto.getSenderId());
                smsConfigRepository.save(config);
        }

        public Page<NotificationLogResponse> getSmsLogs(Pageable pageable) {
                Tenant tenant = getCurrentTenant();
                return smsLogRepository.findByTenantId(tenant.getId(), pageable)
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
}
