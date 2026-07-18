package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsConsentResponse;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.entity.AtsApplicantConsent;
import com.example.multi_tanent.ats.enums.ConsentStatus;
import com.example.multi_tanent.ats.enums.EmailStatus;
import com.example.multi_tanent.ats.repository.AtsApplicantRepository;
import com.example.multi_tanent.ats.repository.AtsConsentRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
@Slf4j
public class AtsConsentService {

    private final AtsConsentRepository atsConsentRepository;
    private final AtsApplicantRepository atsApplicantRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Qualifier("emailChannel")
    private final NotificationChannel emailChannel;

    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsConsentResponse> getConsents(String tab, String search, Pageable pageable) {
        Tenant tenant = currentTenant();
        
        Page<AtsApplicantConsent> page;
        if ("docs_pending".equalsIgnoreCase(tab)) {
            page = atsConsentRepository.findVerificationPendingConsents(tenant.getId(), search, pageable);
        } else {
            ConsentStatus status = "rejected".equalsIgnoreCase(tab) ? ConsentStatus.REJECTED : ConsentStatus.PENDING;
            page = atsConsentRepository.findByTenantIdAndConsentStatus(tenant.getId(), status, search, pageable);
        }
        
        return page.map(this::toResponse);
    }

    public void sendConsent(Long applicantId) {
        Tenant tenant = currentTenant();
        AtsApplicant applicant = atsApplicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        // Generate token and expiry (7 days)
        String token = UUID.randomUUID().toString();
        OffsetDateTime expiry = OffsetDateTime.now().plusDays(7);

        // Find or create consent record
        AtsApplicantConsent consent = atsConsentRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId())
                .orElseGet(() -> AtsApplicantConsent.builder()
                        .tenant(tenant)
                        .applicant(applicant)
                        .build());

        consent.setConsentStatus(ConsentStatus.PENDING);
        consent.setEmailSentTo(applicant.getEmail());
        consent.setConsentSentAt(OffsetDateTime.now());
        consent.setConsentToken(token);
        consent.setTokenExpiry(expiry);
        consent.setRejectionReason(null);
        consent.setRespondedAt(null);

        // Set sent_by if employee is present in security context
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        userRepository.findByEmail(currentUsername).ifPresent(user -> {
            employeeRepository.findByUserId(user.getId()).ifPresent(consent::setSentBy);
        });

        try {
            // Build consent verification link URLs
            String acceptUrl = apiBaseUrl + "/api/public/ats/consent/respond?token=" + token + "&action=accept";
            String rejectUrl = apiBaseUrl + "/api/public/ats/consent/respond?token=" + token + "&action=reject";

            String htmlBody = String.format(
                    "<h3>GDPR Data Privacy Consent Request</h3>" +
                    "<p>Dear %s %s,</p>" +
                    "<p>To process your application for the position of <strong>%s</strong>, we require your explicit consent to collect and store your personal data in accordance with our privacy policy.</p>" +
                    "<p>Please review and respond by clicking one of the options below:</p>" +
                    "<p>" +
                    "  <a href=\"%s\" style=\"background-color: #10b981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;\">Accept Consent</a>" +
                    "  <a href=\"%s\" style=\"background-color: #ef4444; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;\">Reject Consent</a>" +
                    "</p>" +
                    "<p>This request link will expire in 7 days.</p>" +
                    "<p>Best regards,<br/>Recruitment Team</p>",
                    applicant.getFirstName(), applicant.getLastName(), applicant.getJobTitle(), acceptUrl, rejectUrl
            );

            NotificationRequest mailRequest = NotificationRequest.builder()
                    .tenantId(tenant.getId())
                    .recipient(applicant.getEmail())
                    .subject("Action Required: Data Privacy Consent Request")
                    .body(htmlBody)
                    .build();

            emailChannel.send(mailRequest);
            consent.setEmailStatus(EmailStatus.SENT);
        } catch (Exception e) {
            log.error("Failed to send consent email to {}: {}", applicant.getEmail(), e.getMessage());
            consent.setEmailStatus(EmailStatus.FAILED);
            atsConsentRepository.save(consent);
            throw new RuntimeException("Consent email sending failed: " + e.getMessage(), e);
        }

        atsConsentRepository.save(consent);
    }

    public void deleteConsent(Long consentId) {
        Tenant tenant = currentTenant();
        AtsApplicantConsent consent = atsConsentRepository.findById(consentId)
                .orElseThrow(() -> new EntityNotFoundException("Consent record not found with id: " + consentId));
        
        if (!consent.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete consent for another tenant.");
        }
        
        atsConsentRepository.delete(consent);
    }

    // Public respondent endpoint logic (unauthenticated)
    @Transactional("tenantTx")
    public String respondToConsent(String token, String action, String reason) {
        AtsApplicantConsent consent = atsConsentRepository.findByConsentToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired consent token."));

        if (consent.getTokenExpiry().isBefore(OffsetDateTime.now())) {
            consent.setConsentStatus(ConsentStatus.EXPIRED);
            atsConsentRepository.save(consent);
            return "EXPIRED";
        }

        if ("accept".equalsIgnoreCase(action)) {
            consent.setConsentStatus(ConsentStatus.ACCEPTED);
            consent.setRejectionReason(null);
        } else {
            consent.setConsentStatus(ConsentStatus.REJECTED);
            consent.setRejectionReason(reason);
        }

        consent.setRespondedAt(OffsetDateTime.now());
        // Invalidate token after response
        consent.setConsentToken(null);
        atsConsentRepository.save(consent);

        return consent.getConsentStatus().name();
    }

    private AtsConsentResponse toResponse(AtsApplicantConsent consent) {
        AtsApplicant applicant = consent.getApplicant();
        String createdByName = "N/A";
        if (applicant.getCreatedBy() != null) {
            createdByName = applicant.getCreatedBy().getFirstName() + " " + applicant.getCreatedBy().getLastName();
        }

        return AtsConsentResponse.builder()
                .consentId(consent.getId())
                .applicantId(applicant.getId())
                .applicantName(applicant.getFirstName() + " " + applicant.getLastName())
                .email(consent.getEmailSentTo())
                .source(applicant.getSource() != null ? applicant.getSource().name() : "N/A")
                .createdBy(createdByName)
                .createdOn(applicant.getCreatedAt())
                .consentSentOn(consent.getConsentSentAt())
                .emailStatus(consent.getEmailStatus().name())
                .consentStatus(consent.getConsentStatus().name())
                .rejectionReason(consent.getRejectionReason())
                .build();
    }
}
