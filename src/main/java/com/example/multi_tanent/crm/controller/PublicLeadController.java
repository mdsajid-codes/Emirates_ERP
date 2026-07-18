package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.LeadIntakeDto;
import com.example.multi_tanent.crm.services.LeadIntakeService;
import com.example.multi_tanent.crm.services.TenantApiKeyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/public/leads")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicLeadController {

    private final LeadIntakeService intakeService;
    private final TenantApiKeyService apiKeyService;

    /**
     * Generic lead intake endpoint for any website or system.
     * Requires X-Api-Key header.
     */
    @PostMapping("/intake")
    public ResponseEntity<?> genericIntake(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestBody LeadIntakeDto dto) {
        
        return handleIntake(apiKey, dto);
    }

    /**
     * Facebook Lead Ads Webhook Receiver.
     * Point Facebook Lead Ads webhook here.
     */
    @PostMapping("/facebook")
    public ResponseEntity<?> facebookWebhook(
            @RequestParam("api_key") String apiKey, // Passed as query param in webhook URL
            @RequestBody Map<String, Object> payload) {
        
        log.info("Received Facebook Lead Ads webhook for api_key: {}", apiKey);
        
        // Facebook payload is complex. Here we simplify for the demo.
        LeadIntakeDto dto = mapFacebookPayload(payload);
        return handleIntake(apiKey, dto);
    }

    /**
     * Facebook Webhook Verification (Challenge).
     * Meta requires this to verify your endpoint.
     */
    @GetMapping("/facebook")
    public ResponseEntity<String> facebookVerify(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {
        
        log.info("Verifying Facebook Webhook: challenge={}", challenge);
        return ResponseEntity.ok(challenge);
    }

    private ResponseEntity<?> handleIntake(String apiKey, LeadIntakeDto dto) {
        if (apiKey == null) {
            return ResponseEntity.status(401).body("Missing X-Api-Key");
        }

        Optional<String> tenantId = apiKeyService.validateApiKeyAndGetTenantId(apiKey);
        if (tenantId.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid API Key");
        }

        try {
            // Set tenant context manually for this thread
            TenantContext.setTenantId(tenantId.get());
            intakeService.processIntake(dto);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Lead captured successfully"));
        } catch (Exception e) {
            log.error("Error processing lead intake", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        } finally {
            TenantContext.clear();
        }
    }

    private LeadIntakeDto mapFacebookPayload(Map<String, Object> payload) {
        // Simplified mapping logic
        // Real implementation would look into payload.entry[0].changes[0].value.field_data
        return LeadIntakeDto.builder()
                .firstName("Facebook")
                .lastName("Lead")
                .source("Facebook")
                .notes("Payload received: " + payload.toString())
                .build();
    }
}
