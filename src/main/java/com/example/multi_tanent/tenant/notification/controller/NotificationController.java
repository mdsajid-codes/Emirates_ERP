package com.example.multi_tanent.tenant.notification.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.security.JwtUtil;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.notification.dto.NotificationResponse;
import com.example.multi_tanent.tenant.notification.repository.NotificationRepository;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import com.example.multi_tanent.tenant.notification.service.SseService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final SseService sseService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final com.example.multi_tanent.tenant.employee.repository.EmployeeRepository employeeRepository;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            Authentication auth,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {

        Long userId;
        if (auth != null && auth.isAuthenticated()) {
            userId = resolveUserId(auth);
        } else if (token != null && !token.isBlank()) {
            try {
                Jws<Claims> claims = jwtUtil.parse(token);
                String username = claims.getBody().getSubject();
                String tenantId = claims.getBody().get("tenantId", String.class);
                TenantContext.setTenantId(tenantId);
                userId = findUserIdByEmail(username);
            } catch (Exception e) {
                SseEmitter errorEmitter = new SseEmitter();
                errorEmitter.completeWithError(new RuntimeException("Invalid token"));
                return errorEmitter;
            }
        } else {
            SseEmitter errorEmitter = new SseEmitter();
            errorEmitter.completeWithError(new RuntimeException("Unauthorized"));
            return errorEmitter;
        }

        log.info("SSE stream opened for userId={}", userId);
        return sseService.createEmitter(userId);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationResponse>> list(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(
            notificationService.getNotifications(userId, page, size));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> unreadCount(Authentication auth) {
        return ResponseEntity.ok(
            notificationService.getUnreadCount(resolveUserId(auth)));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        notificationService.markAllRead(resolveUserId(auth));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/announce")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR')")
    public ResponseEntity<Void> announce(@RequestBody com.example.multi_tanent.tenant.notification.dto.AnnouncementRequest req) {
        java.util.List<com.example.multi_tanent.spersusers.enitity.Employee> targets = 
            employeeRepository.findByStatus(com.example.multi_tanent.spersusers.enums.EmployeeStatus.ACTIVE);

        for (com.example.multi_tanent.spersusers.enitity.Employee emp : targets) {
            if (emp.getUser() != null) {
                notificationService.send(
                    emp.getUser().getId(),
                    com.example.multi_tanent.tenant.notification.enums.NotificationType.GENERAL_ANNOUNCEMENT,
                    "HR Announcement",
                    req.getMessage(),
                    "/hrdashboard",
                    null,
                    null,
                    com.example.multi_tanent.tenant.notification.enums.NotificationPriority.LOW
                );
            }
        }
        return ResponseEntity.ok().build();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Long findUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email))
            .getId();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Long resolveUserId(Authentication auth) {
        return findUserIdByEmail(auth.getName());
    }
}
