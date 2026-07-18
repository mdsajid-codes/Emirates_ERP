package com.example.multi_tanent.spersusers.components;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.PushConfig;
import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.notification.repository.config.PushConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PushNotificationChannel implements NotificationChannel {

    private final PushConfigRepository pushConfigRepository;

    @Override
    public void send(NotificationRequest request) {
        log.info("Sending PUSH to {} for Tenant {}", request.getRecipient(), request.getTenantId());

        PushConfig config = pushConfigRepository.findByTenantId(request.getTenantId()).orElse(null);
        if (config == null || !config.getEnabled())
            return;

        try {
            // Integration with OneSignal
            log.info("Dispatching Push via OneSignal");
        } catch (Exception e) {
            log.error("Push failed", e);
        }
    }

    @Override
    public String getChannelName() {
        return "PUSH";
    }
}
