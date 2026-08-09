package com.example.multi_tanent.tenant.notification.entity;

import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notif_recipient",       columnList = "recipient_user_id"),
        @Index(name = "idx_notif_recipient_unread", columnList = "recipient_user_id, is_read"),
        @Index(name = "idx_notif_created",          columnList = "created_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user_id of the person who should receive this notification */
    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    /** Category — maps to NotificationType enum */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 80)
    private NotificationType type;

    /** Short headline shown in the bell dropdown */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /** Full notification body text */
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    /** Frontend deep-link URL — navigated to when user clicks the notification */
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    /** ID of the triggering entity (e.g. LeaveRequest.id, Payslip.id) */
    @Column(name = "reference_id")
    private Long referenceId;

    /** Class name of the triggering entity for polymorphic use */
    @Column(name = "reference_type", length = 80)
    private String referenceType;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private NotificationPriority priority = NotificationPriority.MEDIUM;
}
