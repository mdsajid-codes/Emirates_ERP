package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.SmsTemplateDto;
import com.example.multi_tanent.spersusers.notification.service.SmsTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification/templates/sms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SmsTemplateController {

    private final SmsTemplateService templateService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SmsTemplateDto>> getTemplates() {
        return ResponseEntity.ok(templateService.getTemplates());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveTemplate(@RequestBody SmsTemplateDto dto) {
        templateService.saveTemplate(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
