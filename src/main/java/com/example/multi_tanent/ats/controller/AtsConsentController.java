package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsConsentResponse;
import com.example.multi_tanent.ats.services.AtsConsentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/consent")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsConsentController {

    private final AtsConsentService consentService;

    @GetMapping
    public ResponseEntity<Page<AtsConsentResponse>> getConsents(
            @RequestParam(defaultValue = "pending") String tab,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(consentService.getConsents(tab, search, pageable));
    }

    @PostMapping("/send/{applicantId}")
    public ResponseEntity<Void> sendConsent(@PathVariable Long applicantId) {
        consentService.sendConsent(applicantId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{consentId}")
    public ResponseEntity<Void> deleteConsent(@PathVariable Long consentId) {
        consentService.deleteConsent(consentId);
        return ResponseEntity.noContent().build();
    }
}
