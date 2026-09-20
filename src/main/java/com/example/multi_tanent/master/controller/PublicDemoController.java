package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.dto.DemoRequestDto;
import com.example.multi_tanent.master.entity.DemoRequest;
import com.example.multi_tanent.master.entity.DemoRequestStatus;
import com.example.multi_tanent.master.repository.DemoRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public-facing demo request intake endpoint.
 * No JWT required — validated via a static X-Api-Key read from application.properties.
 *
 * WHY NOT TenantApiKeyService?
 *   TenantApiKeyService.validateApiKeyAndGetTenantId() queries crm_tenant_api_keys,
 *   a tenant-scoped table. This controller runs at the master level (no tenant context),
 *   so that lookup always returns empty → 401. We use a static property key instead.
 *
 * Module-agnostic: accepts "POS", "HRMS", "CRM", etc. without any code change.
 */
@Slf4j
@RestController
@RequestMapping("/api/public/demo-request")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicDemoController {

    private final DemoRequestRepository demoRequestRepository;

    @Value("${demo.public.api-key}")
    private String validApiKey;

    @PostMapping
    public ResponseEntity<?> submitDemoRequest(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestBody DemoRequestDto dto) {

        // Validate static API key
        if (apiKey == null || !apiKey.equals(validApiKey)) {
            log.warn("Demo request rejected — invalid API key: {}", apiKey);
            return ResponseEntity.status(401).body("Invalid or missing API key");
        }

        // Minimum field validation
        if (dto.getFullName() == null || dto.getFullName().isBlank()
                || dto.getEmail() == null || dto.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Full Name and Email are required");
        }

        DemoRequest request = DemoRequest.builder()
                .fullName(dto.getFullName().trim())
                .email(dto.getEmail().trim().toLowerCase())
                .phone(dto.getPhone())
                .company(dto.getCompany())
                .module(dto.getModule() != null ? dto.getModule() : "POS")
                .terminals(dto.getTerminals())
                .businessType(dto.getBusinessType())
                .message(dto.getMessage())
                .source(dto.getSource() != null ? dto.getSource() : "Website Demo Request")
                .status(DemoRequestStatus.PENDING)
                .build();

        demoRequestRepository.save(request);

        log.info("Demo request saved | module={} | from={} <{}>",
                request.getModule(), request.getFullName(), request.getEmail());

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Demo request submitted successfully"
        ));
    }
}
