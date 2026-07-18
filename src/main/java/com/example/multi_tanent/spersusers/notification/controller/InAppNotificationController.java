package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.enitity.notification.entity.NotificationInAppMessage;
import com.example.multi_tanent.spersusers.notification.service.InAppNotificationService;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/inapp")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InAppNotificationController {

    private final InAppNotificationService inAppService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationInAppMessage>> getMyInAppMessages(Pageable pageable) {
        return ResponseEntity.ok(inAppService.getMyInAppMessages(getCurrentUser().getId(), pageable));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        inAppService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead() {
        inAppService.markAllAsRead(getCurrentUser().getId());
        return ResponseEntity.ok().build();
    }
}
