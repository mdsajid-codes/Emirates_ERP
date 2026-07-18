package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.entity.CrmLeadAttachment;
import com.example.multi_tanent.crm.services.CrmLeadAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/crm/leads")
@RequiredArgsConstructor
public class CrmLeadAttachmentController {

    private final CrmLeadAttachmentService attachmentService;

    @PostMapping("/{leadId}/attachments")
    @PreAuthorize("@crmAccess.canCreate('ATTACHMENT')")
    public ResponseEntity<CrmLeadAttachment> uploadAttachment(
            @PathVariable Long leadId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadAttachment(leadId, file));
    }

    @GetMapping("/{leadId}/attachments")
    @PreAuthorize("@crmAccess.canView('ATTACHMENT')")
    public ResponseEntity<List<CrmLeadAttachment>> getAttachments(@PathVariable Long leadId) {
        return ResponseEntity.ok(attachmentService.getAttachments(leadId));
    }

    @GetMapping("/attachments/{attachmentId}/preview")
    @PreAuthorize("@crmAccess.canView('ATTACHMENT')")
    public ResponseEntity<Resource> previewAttachment(@PathVariable Long attachmentId) {
        Resource resource = attachmentService.loadFileAsResource(attachmentId);
        
        String contentType = "application/octet-stream";
        // Simple content type detection based on extension
        String filename = resource.getFilename();
        if (filename != null) {
            if (filename.endsWith(".pdf")) contentType = "application/pdf";
            else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (filename.endsWith(".png")) contentType = "image/png";
            else if (filename.endsWith(".gif")) contentType = "image/gif";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    @PreAuthorize("@crmAccess.canDelete('ATTACHMENT')")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
