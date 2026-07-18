package com.example.multi_tanent.spersusers.notification.repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.NotificationInAppMessage;
import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationInAppMessageRepository extends JpaRepository<NotificationInAppMessage, Long> {
    List<NotificationInAppMessage> findByRecipientIdAndStatusAndArchivedFalse(Long userId, NotificationStatus status);

    Page<NotificationInAppMessage> findByRecipientIdAndStatusAndArchivedFalse(Long userId, NotificationStatus status,
            Pageable pageable);
}
