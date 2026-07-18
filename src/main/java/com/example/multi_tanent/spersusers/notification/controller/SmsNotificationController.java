package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.NotificationLogResponse;
import com.example.multi_tanent.spersusers.notification.dto.SmsConfigDto;
import com.example.multi_tanent.spersusers.notification.service.SmsNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/sms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SmsNotificationController {

    private final SmsNotificationService smsService;

    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SmsConfigDto> getSmsConfig() {
        return ResponseEntity.ok(smsService.getSmsConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveSmsConfig(@RequestBody SmsConfigDto dto) {
        smsService.saveSmsConfig(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationLogResponse>> getSmsLogs(Pageable pageable) {
        return ResponseEntity.ok(smsService.getSmsLogs(pageable));
    }
}
