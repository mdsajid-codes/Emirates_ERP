package com.example.multi_tanent.spersusers.notification.controller;

import com.example.multi_tanent.spersusers.notification.dto.EmailTemplateDto;
import com.example.multi_tanent.spersusers.notification.dto.EmailTemplateTestDto;
import com.example.multi_tanent.spersusers.notification.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification/templates/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmailTemplateController {

    private final EmailTemplateService templateService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EmailTemplateDto>> getTemplates() {
        return ResponseEntity.ok(templateService.getTemplates());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveTemplate(@RequestBody EmailTemplateDto dto) {
        templateService.saveTemplate(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> testTemplate(@RequestBody EmailTemplateTestDto dto) {
        templateService.testTemplate(dto.getTemplate(), dto.getRecipient());
        return ResponseEntity.ok().build();
    }
}
