package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.PushConfigDto;
import com.example.multi_tanent.spersusers.notification.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/push")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PushNotificationController {

    private final PushNotificationService pushService;

    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PushConfigDto> getPushConfig() {
        return ResponseEntity.ok(pushService.getPushConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> savePushConfig(@RequestBody PushConfigDto dto) {
        pushService.savePushConfig(dto);
        return ResponseEntity.ok().build();
    }
}
