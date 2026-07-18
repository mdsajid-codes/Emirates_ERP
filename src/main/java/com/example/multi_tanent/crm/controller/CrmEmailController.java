package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmEmailDto;
import com.example.multi_tanent.crm.dto.CrmEmailRequestDto;
import com.example.multi_tanent.crm.services.CrmEmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/emails")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CrmEmailController {

    private final CrmEmailService emailService;

    @PostMapping("/send")
    @PreAuthorize("@crmAccess.canSendEmail('EMAIL')")
    public ResponseEntity<CrmEmailDto> sendEmail(@Valid @RequestBody CrmEmailRequestDto request) {
        CrmEmailDto sentEmail = emailService.sendEmail(request);
        return new ResponseEntity<>(sentEmail, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("@crmAccess.canView('EMAIL')")
    public ResponseEntity<Page<CrmEmailDto>> getAllEmails(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(emailService.getAllEmails(pageable));
    }

    @GetMapping("/by-lead/{leadId}")
    @PreAuthorize("@crmAccess.canView('EMAIL')")
    public ResponseEntity<List<CrmEmailDto>> getEmailsByLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(emailService.getEmailsByLeadId(leadId));
    }
}