package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.WhatsAppTemplateDto;
import com.example.multi_tanent.spersusers.notification.service.WhatsAppTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification/templates/whatsapp")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WhatsAppTemplateController {

    private final WhatsAppTemplateService templateService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WhatsAppTemplateDto>> getTemplates() {
        return ResponseEntity.ok(templateService.getTemplates());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveTemplate(@RequestBody WhatsAppTemplateDto dto) {
        templateService.saveTemplate(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateTemplate(@PathVariable Long id, @RequestBody WhatsAppTemplateDto dto) {
        dto.setId(id);
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
