package com.example.multi_tanent.spersusers.components;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.TelegramConfig;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.notification.repository.config.TelegramConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TelegramChannel implements NotificationChannel {

    private final TelegramConfigRepository telegramConfigRepository;

    @Override
    public void send(NotificationRequest request) {
        log.info("Sending TELEGRAM to {} for Tenant {}", request.getRecipient(), request.getTenantId());

        TelegramConfig config = telegramConfigRepository.findByTenantId(request.getTenantId()).orElse(null);
        if (config == null || !config.getEnabled())
            
            return;

        try {
            log.info("Dispatching Telegram bot message");
        } catch (Exception e) {
            log.error("Telegram failed", e);
        }
    }

    @Override
    public String getChannelName() {
        return "TELEGRAM";
    }
}
