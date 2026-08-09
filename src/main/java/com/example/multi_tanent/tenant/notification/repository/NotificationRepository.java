package com.example.multi_tanent.tenant.notification.repository;

import com.example.multi_tanent.tenant.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(
        Long recipientUserId, Pageable pageable);

    long countByRecipientUserIdAndIsReadFalse(Long recipientUserId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now " +
           "WHERE n.recipientUserId = :userId AND n.isRead = false")
    void markAllReadForUser(@Param("userId") Long userId,
                            @Param("now") LocalDateTime now);
}
