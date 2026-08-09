package com.example.multi_tanent.tenant.notification.service;

import com.example.multi_tanent.tenant.notification.dto.NotificationResponse;
import com.example.multi_tanent.tenant.notification.entity.Notification;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SseService sseService;

    @InjectMocks
    private NotificationService notificationService;

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = new Notification();
        sampleNotification.setId(1L);
        sampleNotification.setRecipientUserId(100L);
        sampleNotification.setType(NotificationType.LEAVE_REQUEST_SUBMITTED);
        sampleNotification.setTitle("Test Title");
        sampleNotification.setMessage("Test Message");
        sampleNotification.setActionUrl("/leave");
        sampleNotification.setReferenceId(50L);
        sampleNotification.setReferenceType("LEAVE_REQUEST");
        sampleNotification.setIsRead(false);
        sampleNotification.setPriority(NotificationPriority.HIGH);
        sampleNotification.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Phase 1: Send notification saves to database and pushes via SSE")
    void sendNotification_SavesAndPushesSse() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

        notificationService.send(
            100L,
            NotificationType.LEAVE_REQUEST_SUBMITTED,
            "Test Title",
            "Test Message",
            "/leave",
            50L,
            "LEAVE_REQUEST",
            NotificationPriority.HIGH
        );

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(100L, saved.getRecipientUserId());
        assertEquals(NotificationType.LEAVE_REQUEST_SUBMITTED, saved.getType());
        assertEquals("Test Title", saved.getTitle());
        assertEquals("Test Message", saved.getMessage());
        assertEquals(NotificationPriority.HIGH, saved.getPriority());

        verify(sseService, times(1)).pushToUser(eq(100L), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("Phase 1: Mark single notification as read updates status and readAt timestamp")
    void markAsRead_UpdatesIsReadAndReadAt() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));

        notificationService.markAsRead(1L);

        assertTrue(sampleNotification.getIsRead());
        assertNotNull(sampleNotification.getReadAt());
    }

    @Test
    @DisplayName("Phase 1: Mark all read calls repository bulk update")
    void markAllRead_CallsRepositoryBulkUpdate() {
        notificationService.markAllRead(100L);

        verify(notificationRepository, times(1)).markAllReadForUser(eq(100L), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Phase 1: Get unread count returns repository count")
    void getUnreadCount_ReturnsCount() {
        when(notificationRepository.countByRecipientUserIdAndIsReadFalse(100L)).thenReturn(5L);

        long count = notificationService.getUnreadCount(100L);

        assertEquals(5L, count);
        verify(notificationRepository, times(1)).countByRecipientUserIdAndIsReadFalse(100L);
    }

    @Test
    @DisplayName("Phase 1: Get paginated notifications converts entity page to DTO page")
    void getNotifications_ReturnsMappedPage() {
        Page<Notification> page = new PageImpl<>(List.of(sampleNotification));
        when(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(eq(100L), any(PageRequest.class)))
            .thenReturn(page);

        Page<NotificationResponse> result = notificationService.getNotifications(100L, 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Title", result.getContent().get(0).getTitle());
    }
}
