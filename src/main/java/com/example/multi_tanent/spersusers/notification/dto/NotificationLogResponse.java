package com.example.multi_tanent.spersusers.notification.dto;

import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLogResponse {
    private Long id;
    private String recipient;
    private String subject;
    private String body;
    private String templateId;
    private NotificationStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
    private String providerMessageId;
}
