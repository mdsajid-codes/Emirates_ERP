package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.NotificationLogResponse;
import com.example.multi_tanent.spersusers.notification.dto.WhatsAppConfigDto;
import com.example.multi_tanent.spersusers.notification.service.WhatsAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/whatsapp")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WhatsAppNotificationController {

    private final WhatsAppNotificationService whatsappService;

    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WhatsAppConfigDto> getWhatsAppConfig() {
        return ResponseEntity.ok(whatsappService.getWhatsAppConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> saveWhatsAppConfig(@RequestBody WhatsAppConfigDto dto) {
        whatsappService.saveWhatsAppConfig(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationLogResponse>> getWhatsAppLogs(Pageable pageable) {
        return ResponseEntity.ok(whatsappService.getWhatsAppLogs(pageable));
    }

    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<String> testConnection(
            @RequestParam String recipient,
            @RequestParam String templateId) {
        whatsappService.sendTestMessage(recipient, templateId);
        return ResponseEntity.ok("Test message initiated");
    }
}
