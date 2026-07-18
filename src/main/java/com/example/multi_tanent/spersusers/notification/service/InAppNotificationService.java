package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.spersusers.enitity.notification.entity.NotificationInAppMessage;
import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import com.example.multi_tanent.spersusers.notification.repository.NotificationInAppMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class InAppNotificationService {

    private final NotificationInAppMessageRepository inAppMessageRepository;

    public Page<NotificationInAppMessage> getMyInAppMessages(Long userId, Pageable pageable) {
        return inAppMessageRepository.findByRecipientIdAndStatusAndArchivedFalse(userId, NotificationStatus.SENT,
                pageable);
    }

    public void markAsRead(Long messageId) {
        inAppMessageRepository.findById(messageId).ifPresent(msg -> {
            msg.setStatus(NotificationStatus.READ);
            msg.setReadAt(LocalDateTime.now());
            inAppMessageRepository.save(msg);
        });
    }

    public void markAllAsRead(Long userId) {
        inAppMessageRepository.findByRecipientIdAndStatusAndArchivedFalse(userId, NotificationStatus.SENT)
                .forEach(msg -> {
                    msg.setStatus(NotificationStatus.READ);
                    msg.setReadAt(LocalDateTime.now());
                    inAppMessageRepository.save(msg);
                });
    }
}
