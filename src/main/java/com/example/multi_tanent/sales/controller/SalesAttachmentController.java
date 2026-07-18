package com.example.multi_tanent.sales.controller;

import com.example.multi_tanent.tenant.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/sales/attachments")
@RequiredArgsConstructor
public class SalesAttachmentController {

    private final FileStorageService fileStorageService;

    @GetMapping("/**")
    public ResponseEntity<Resource> getAttachment(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        // Extract path after /api/sales/attachments/
        String filePath = requestUri.substring(requestUri.indexOf("/attachments/") + "/attachments/".length());
        // URL decode the file path to handle spaces and special characters
        filePath = java.net.URLDecoder.decode(filePath, java.nio.charset.StandardCharsets.UTF_8);

        boolean isTenantSpecific = true;
        // Check if it's a rental quotation (stored publicly)
        if (filePath.startsWith("rental_quotations/") || filePath.startsWith("rental-quotations/")
                || filePath.startsWith("quotations/")) {
            isTenantSpecific = false;
        }

        Resource resource;
        try {
            resource = fileStorageService.loadFileAsResource(filePath, isTenantSpecific);
        } catch (Exception e) {
            // Fallback: If public load failed and we tried public (false), try private
            // (true)
            // This supports old files that were stored privately
            if (!isTenantSpecific) {
                try {
                    resource = fileStorageService.loadFileAsResource(filePath, true);
                } catch (Exception ex) {
                    throw e; // Throw original exception (File not found) if fallback also fails
                }
            } else {
                throw e;
            }
        }

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/view")
    public ResponseEntity<Resource> viewAttachment(@RequestParam("file") String filePath, HttpServletRequest request) {
        // URL decode the file path to handle spaces and special characters
        filePath = java.net.URLDecoder.decode(filePath, java.nio.charset.StandardCharsets.UTF_8);

        boolean isTenantSpecific = true;
        // Check if it's a rental quotation or quotation (stored publicly)
        if (filePath.startsWith("rental_quotations/") || filePath.startsWith("rental-quotations/")
                || filePath.startsWith("quotations/")) {
            isTenantSpecific = false;
        }

        Resource resource;
        try {
            resource = fileStorageService.loadFileAsResource(filePath, isTenantSpecific);
        } catch (Exception e) {
            // Fallback: If public load failed and we tried public (false), try private
            // (true)
            if (!isTenantSpecific) {
                try {
                    resource = fileStorageService.loadFileAsResource(filePath, true);
                } catch (Exception ex) {
                    throw e; // Throw original exception if fallback also fails
                }
            } else {
                throw e;
            }
        }

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
