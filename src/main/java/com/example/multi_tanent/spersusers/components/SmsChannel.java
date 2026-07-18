package com.example.multi_tanent.spersusers.components;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.SmsConfig;
import com.example.multi_tanent.spersusers.enitity.notification.entity.log.SmsLog;
import com.example.multi_tanent.spersusers.enitity.notification.entity.template.SmsTemplate;
import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.notification.repository.config.SmsConfigRepository;
import com.example.multi_tanent.spersusers.notification.repository.template.SmsTemplateRepository;
import com.example.multi_tanent.spersusers.notification.repository.log.SmsLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmsChannel implements NotificationChannel {

    private final SmsConfigRepository smsConfigRepository;
    private final SmsTemplateRepository smsTemplateRepository;
    private final SmsLogRepository smsLogRepository;

    @Override
    public void send(NotificationRequest request) {
        log.info("Sending SMS to {} for Tenant {}", request.getRecipient(), request.getTenantId());

        SmsConfig config = smsConfigRepository.findByTenantId(request.getTenantId()).orElse(null);
        if (config == null || !config.getEnabled())
            return;

        try {
            String body = request.getBody();
            if (StringUtils.hasText(request.getTemplateId())) {
                SmsTemplate template = smsTemplateRepository.findByTenantIdAndTemplateIdAndActiveTrue(
                        request.getTenantId(), request.getTemplateId()).orElse(null);
                if (template != null)
                    body = template.getBody();
            }
            // Integration logic here
            saveLog(request, NotificationStatus.SENT, null, "SMS-MOCK-ID");
        } catch (Exception e) {
            saveLog(request, NotificationStatus.FAILED, e.getMessage(), null);
        }
    }

    private void saveLog(NotificationRequest request, NotificationStatus status, String error, String providerId) {
        smsLogRepository.save(SmsLog.builder()
                .tenantId(request.getTenantId())
                .recipient(request.getRecipient())
                .body(request.getBody())
                .templateId(request.getTemplateId())
                .status(status)
                .errorMessage(error)
                .providerMessageId(providerId)
                .build());
    }

    @Override
    public String getChannelName() {
        return "SMS";
    }
}