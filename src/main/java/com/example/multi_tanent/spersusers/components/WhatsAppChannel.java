package com.example.multi_tanent.spersusers.components;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.WhatsAppConfig;
import com.example.multi_tanent.spersusers.enitity.notification.entity.log.WhatsAppLog;
import com.example.multi_tanent.spersusers.enitity.notification.entity.template.WhatsAppTemplate;
import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.notification.repository.config.WhatsAppConfigRepository;
import com.example.multi_tanent.spersusers.notification.repository.template.WhatsAppTemplateRepository;
import com.example.multi_tanent.spersusers.notification.repository.log.WhatsAppLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WhatsAppChannel implements NotificationChannel {

    private final WhatsAppConfigRepository whatsappConfigRepository;
    private final WhatsAppTemplateRepository whatsappTemplateRepository;
    private final WhatsAppLogRepository whatsappLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void send(NotificationRequest request) {
        log.info("Sending WhatsApp to {} for Tenant {}", request.getRecipient(), request.getTenantId());

        WhatsAppConfig config = whatsappConfigRepository.findByTenantId(request.getTenantId()).orElse(null);
        if (config == null || !config.getEnabled() || !StringUtils.hasText(config.getApiKey())) {
            log.warn("WhatsApp not configured or disabled for Tenant {}", request.getTenantId());
            return;
        }

        try {
            String wabaTemplateId = null;
            if (StringUtils.hasText(request.getTemplateId())) {
                WhatsAppTemplate template = whatsappTemplateRepository.findByTenantIdAndTemplateIdAndActiveTrue(
                        request.getTenantId(), request.getTemplateId()).orElse(null);
                if (template != null) {
                    wabaTemplateId = template.getWhatsappTemplateId();
                }
            }

            if (wabaTemplateId == null) {
                log.warn("No valid WhatsApp template found for ID: {}", request.getTemplateId());
                saveLog(request, NotificationStatus.FAILED, "No valid WhatsApp template found", null);
                return;
            }

            // Meta Cloud API Call
            String url = "https://graph.facebook.com/v22.0/" + config.getPhoneNumberId() + "/messages";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(config.getApiKey());

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("to", request.getRecipient());
            body.put("type", "template");

            Map<String, Object> templateMap = new HashMap<>();
            templateMap.put("name", wabaTemplateId);

            Map<String, Object> language = new HashMap<>();

            // Get language code from template if available, otherwise default to en_US
            String langCode = "en_US";
            if (StringUtils.hasText(request.getTemplateId())) {
                WhatsAppTemplate template = whatsappTemplateRepository.findByTenantIdAndTemplateIdAndActiveTrue(
                        request.getTenantId(), request.getTemplateId()).orElse(null);
                if (template != null && StringUtils.hasText(template.getLanguageCode())) {
                    langCode = template.getLanguageCode();
                }
            }

            language.put("code", langCode);
            templateMap.put("language", language);
            body.put("template", templateMap);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String providerId = null;
                if (response.getBody() != null && response.getBody().containsKey("messages")) {
                    List messages = (List) response.getBody().get("messages");
                    if (!messages.isEmpty()) {
                        providerId = (String) ((Map) messages.get(0)).get("id");
                    }
                }
                saveLog(request, NotificationStatus.SENT, null, providerId);
                log.info("WhatsApp sent successfully. Provider ID: {}", providerId);
            } else {
                String error = response.getBody() != null ? response.getBody().toString() : "Unknown error";
                saveLog(request, NotificationStatus.FAILED, error, null);
                log.error("Failed to send WhatsApp: {}", error);
            }
        } catch (Exception e) {
            log.error("Exception in WhatsAppChannel: {}", e.getMessage());
            saveLog(request, NotificationStatus.FAILED, e.getMessage(), null);
        }
    }

    private void saveLog(NotificationRequest request, NotificationStatus status, String error, String providerId) {
        whatsappLogRepository.save(WhatsAppLog.builder()
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
        return "WHATSAPP";
    }
}
