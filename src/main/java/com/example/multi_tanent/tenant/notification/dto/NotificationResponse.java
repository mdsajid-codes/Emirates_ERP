package com.example.multi_tanent.tenant.notification.dto;

import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {

    private Long id;
    private Long recipientUserId;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private Long referenceId;
    private String referenceType;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private NotificationPriority priority;

    public static NotificationResponse from(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setRecipientUserId(n.getRecipientUserId());
        r.setType(n.getType());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setActionUrl(n.getActionUrl());
        r.setReferenceId(n.getReferenceId());
        r.setReferenceType(n.getReferenceType());
        r.setIsRead(n.getIsRead());
        r.setReadAt(n.getReadAt());
        r.setCreatedAt(n.getCreatedAt());
        r.setPriority(n.getPriority());
        return r;
    }
}
