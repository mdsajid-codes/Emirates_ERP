package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.services.TenantApiKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notification/lead-integration")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeadIntegrationController {

    private final TenantApiKeyService apiKeyService;

    @GetMapping("/api-key")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Map<String, String>> getApiKey() {
        return ResponseEntity.ok(Map.of("apiKey", apiKeyService.getOrCreateApiKey()));
    }

    @PostMapping("/api-key/regenerate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Map<String, String>> regenerateApiKey() {
        // This is handled via TenantService.getCurrentTenant() internally
        // But we need the tenantId.
        // Actually TenantApiKeyService.getOrCreateApiKey handles it.
        // Let's make a explicit regenerate in service.
        return ResponseEntity.ok(Map.of("apiKey", apiKeyService.generateNewApiKeyFromContext()));
    }
}
