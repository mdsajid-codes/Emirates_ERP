package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.EmailConfigDto;
import com.example.multi_tanent.spersusers.notification.dto.NotificationLogResponse;
import com.example.multi_tanent.spersusers.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmailNotificationController {

    private final EmailNotificationService emailService;

    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmailConfigDto> getEmailConfig() {
        return ResponseEntity.ok(emailService.getEmailConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveEmailConfig(@RequestBody EmailConfigDto dto) {
        emailService.saveEmailConfig(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationLogResponse>> getEmailLogs(Pageable pageable) {
        return ResponseEntity.ok(emailService.getEmailLogs(pageable));
    }

    @PostMapping("/test-connection")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> testConnection(@RequestBody EmailConfigDto dto) {
        try {
            emailService.testConnection(dto);
            return ResponseEntity.ok("Connection Successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
