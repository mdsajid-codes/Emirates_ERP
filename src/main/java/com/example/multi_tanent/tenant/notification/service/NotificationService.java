package com.example.multi_tanent.tenant.notification.service;

import com.example.multi_tanent.tenant.notification.dto.NotificationResponse;
import com.example.multi_tanent.tenant.notification.entity.Notification;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.config.TenantContext;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SseService sseService;

    @Transactional(transactionManager = "tenantTx")
    public void send(Long recipientUserId,
                     NotificationType type,
                     String title,
                     String message,
                     String actionUrl,
                     Long referenceId,
                     String referenceType,
                     NotificationPriority priority) {
        sendWithTenant(TenantContext.getTenantId(), recipientUserId, type, title, message, actionUrl, referenceId, referenceType, priority);
    }

    public void sendWithTenant(String tenantId,
                              Long recipientUserId,
                              NotificationType type,
                              String title,
                              String message,
                              String actionUrl,
                              Long referenceId,
                              String referenceType,
                              NotificationPriority priority) {
        if (tenantId != null) {
            TenantContext.setTenantId(tenantId);
        }
        try {
            Notification notification = new Notification();
            notification.setRecipientUserId(recipientUserId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setActionUrl(actionUrl);
            notification.setReferenceId(referenceId);
            notification.setReferenceType(referenceType);
            notification.setPriority(priority);
            notification.setIsRead(false);

            Notification saved = notificationRepository.save(notification);
            log.info("Notification saved id={} type={} for userId={} tenant={}", saved.getId(), type, recipientUserId, tenantId);

            sseService.pushToUser(recipientUserId, NotificationResponse.from(saved));
        } finally {
            // Keep context intact
        }
    }

    @Transactional(transactionManager = "tenantTx")
    public void send(Long recipientUserId,
                     NotificationType type,
                     String title,
                     String message,
                     String actionUrl,
                     Long referenceId,
                     String referenceType) {
        send(recipientUserId, type, title, message, actionUrl,
             referenceId, referenceType, NotificationPriority.MEDIUM);
    }

    @Transactional(transactionManager = "tenantTx")
    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new EntityNotFoundException(
                "Notification not found: " + notificationId));
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
    }

    @Transactional(transactionManager = "tenantTx")
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true, transactionManager = "tenantTx")
    public Page<NotificationResponse> getNotifications(Long userId, int page, int size) {
        return notificationRepository
            .findByRecipientUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size))
            .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true, transactionManager = "tenantTx")
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
    }
}
