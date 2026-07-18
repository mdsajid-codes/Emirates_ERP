package com.example.multi_tanent.spersusers.interfaces;

import com.example.multi_tanent.spersusers.dto.NotificationRequest;

public interface NotificationChannel {
    void send(NotificationRequest request);

    String getChannelName();
}