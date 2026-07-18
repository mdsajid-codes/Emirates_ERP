package com.example.multi_tanent.spersusers.service;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final List<NotificationChannel> channels;

    @Async
    public void sendNotification(NotificationRequest request) {
        if (request.getChannels() == null || request.getChannels().isEmpty()) {
            log.warn("No channels specified for notification to {}", request.getRecipient());
            return;
        }

        for (String channelName : request.getChannels()) {
            NotificationChannel channel = channels.stream()
                    .filter(c -> c.getChannelName().equalsIgnoreCase(channelName))
                    .findFirst()
                    .orElse(null);

            if (channel != null) {
                try {
                    channel.send(request);
                } catch (Exception e) {
                    log.error("Failed to send notification via {}", channelName, e);
                }
            } else {
                log.warn("Channel {} not found", channelName);
            }
        }
    }
}