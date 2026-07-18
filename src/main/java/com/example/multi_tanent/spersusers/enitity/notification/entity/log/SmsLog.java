package com.example.multi_tanent.spersusers.enitity.notification.entity.log;

import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notif_sms_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String recipient;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "template_id", length = 100)
    private String templateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "provider_message_id")
    private String providerMessageId;

    @CreationTimestamp
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
