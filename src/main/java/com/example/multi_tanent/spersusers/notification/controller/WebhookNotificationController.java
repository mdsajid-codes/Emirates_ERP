package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.WebhookEndpointDto;
import com.example.multi_tanent.spersusers.notification.service.WebhookNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification/webhooks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WebhookNotificationController {

    private final WebhookNotificationService webhookService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WebhookEndpointDto>> getWebhooks() {
        return ResponseEntity.ok(webhookService.getWebhooks());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> saveWebhook(@RequestBody WebhookEndpointDto dto) {
        webhookService.saveWebhook(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> deleteWebhook(@PathVariable Long id) {
        webhookService.deleteWebhook(id);
        return ResponseEntity.noContent().build();
    }
}
