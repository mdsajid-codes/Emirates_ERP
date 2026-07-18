package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.TelegramConfigDto;
import com.example.multi_tanent.spersusers.notification.service.TelegramNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/telegram")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelegramNotificationController {

    private final TelegramNotificationService telegramService;

    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TelegramConfigDto> getTelegramConfig() {
        return ResponseEntity.ok(telegramService.getTelegramConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> saveTelegramConfig(@RequestBody TelegramConfigDto dto) {
        telegramService.saveTelegramConfig(dto);
        return ResponseEntity.ok().build();
    }
}
