package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsBlacklistResponse;
import com.example.multi_tanent.ats.entity.*;
import com.example.multi_tanent.ats.enums.ApplicantStatus;
import com.example.multi_tanent.ats.repository.*;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsBlacklistService {

    private final AtsApplicantRepository applicantRepository;
    private final AtsClientRepository clientRepository;
    private final AtsClientContactRepository clientContactRepository;
    private final AtsVendorRepository vendorRepository;
    private final AtsVendorContactRepository vendorContactRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    private String currentUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "Admin";
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsBlacklistResponse> getBlacklisted(String type, String search, Pageable pageable) {
        Tenant tenant = currentTenant();
        String query = search != null ? search.trim() : "";

        switch (type.toLowerCase()) {
            case "applicants":
                return applicantRepository.findBlacklisted(tenant.getId(), query, pageable)
                        .map(a -> AtsBlacklistResponse.builder()
                                .id(a.getId())
                                .name((a.getFirstName() != null ? a.getFirstName() : "") + " " + (a.getLastName() != null ? a.getLastName() : ""))
                                .status(a.getApplicantStatus() != null ? a.getApplicantStatus().name() : "N/A")
                                .reason(a.getBlacklistReason())
                                .mobileNumber(a.getMobileNumber())
                                .emailAddress(a.getEmail())
                                .ownership(a.getOwner() != null ? a.getOwner().getFirstName() + " " + a.getOwner().getLastName() : "N/A")
                                .blacklistedBy(a.getBlacklistedBy())
                                .blacklistedDate(a.getBlacklistedDate())
                                .build());

            case "clients":
                return clientRepository.findBlacklisted(tenant.getId(), query, pageable)
                        .map(c -> AtsBlacklistResponse.builder()
                                .id(c.getId())
                                .name(c.getClientName())
                                .status(c.getStatus())
                                .reason(c.getBlacklistReason())
                                .mobileNumber(c.getContactNumber())
                                .emailAddress(c.getEmailId())
                                .ownership(c.getPrimaryOwner() != null ? c.getPrimaryOwner().getFirstName() + " " + c.getPrimaryOwner().getLastName() : "N/A")
                                .blacklistedBy(c.getBlacklistedBy())
                                .blacklistedDate(c.getBlacklistedDate())
                                .build());

            case "client_contacts":
                return clientContactRepository.findBlacklisted(tenant.getId(), query, pageable)
                        .map(cc -> AtsBlacklistResponse.builder()
                                .id(cc.getId())
                                .name((cc.getFirstName() != null ? cc.getFirstName() : "") + " " + (cc.getLastName() != null ? cc.getLastName() : ""))
                                .status(cc.getStatus() != null ? cc.getStatus() : "ACTIVE")
                                .reason(cc.getBlacklistReason())
                                .mobileNumber(cc.getMobileNumber())
                                .emailAddress(cc.getEmailId())
                                .ownership(cc.getPrimaryOwner() != null ? cc.getPrimaryOwner().getFirstName() + " " + cc.getPrimaryOwner().getLastName() : "N/A")
                                .blacklistedBy(cc.getBlacklistedBy())
                                .blacklistedDate(cc.getBlacklistedDate())
                                .build());

            case "vendors":
                return vendorRepository.findBlacklisted(tenant.getId(), query, pageable)
                        .map(v -> AtsBlacklistResponse.builder()
                                .id(v.getId())
                                .name(v.getCompanyName())
                                .status(v.getVendorStatus() != null ? v.getVendorStatus().name() : "ACTIVE")
                                .reason(v.getBlacklistReason())
                                .mobileNumber(v.getPrimaryPhone())
                                .emailAddress(v.getPrimaryEmail())
                                .ownership(v.getOwner() != null ? v.getOwner().getFirstName() + " " + v.getOwner().getLastName() : "N/A")
                                .blacklistedBy(v.getBlacklistedBy())
                                .blacklistedDate(v.getBlacklistedDate())
                                .build());

            case "vendor_contacts":
                return vendorContactRepository.findBlacklisted(tenant.getId(), query, pageable)
                        .map(vc -> AtsBlacklistResponse.builder()
                                .id(vc.getId())
                                .name((vc.getFirstName() != null ? vc.getFirstName() : "") + " " + (vc.getLastName() != null ? vc.getLastName() : ""))
                                .status(vc.getStatus() != null ? vc.getStatus() : "ACTIVE")
                                .reason(vc.getBlacklistReason())
                                .mobileNumber(vc.getMobile())
                                .emailAddress(vc.getEmail())
                                .ownership(vc.getOwner() != null ? vc.getOwner().getFirstName() + " " + vc.getOwner().getLastName() : "N/A")
                                .blacklistedBy(vc.getBlacklistedBy())
                                .blacklistedDate(vc.getBlacklistedDate())
                                .build());

            default:
                throw new IllegalArgumentException("Unknown blacklist entity type: " + type);
        }
    }

    public int unblock(String type, List<Long> ids) {
        Tenant tenant = currentTenant();
        int count = 0;

        for (Long id : ids) {
            switch (type.toLowerCase()) {
                case "applicants":
                    AtsApplicant applicant = applicantRepository.findByIdAndTenantId(id, tenant.getId()).orElse(null);
                    if (applicant != null) {
                        applicant.setIsBlacklisted(false);
                        applicant.setApplicantStatus(ApplicantStatus.NEW_LEAD);
                        applicant.setBlacklistReason(null);
                        applicant.setBlacklistedBy(null);
                        applicant.setBlacklistedDate(null);
                        applicantRepository.save(applicant);
                        count++;
                    }
                    break;

                case "clients":
                    AtsClient client = clientRepository.findByIdAndTenantId(id, tenant.getId()).orElse(null);
                    if (client != null) {
                        client.setIsBlacklisted(false);
                        client.setBlacklistReason(null);
                        client.setBlacklistedBy(null);
                        client.setBlacklistedDate(null);
                        clientRepository.save(client);
                        count++;
                    }
                    break;

                case "client_contacts":
                    AtsClientContact cc = clientContactRepository.findByIdAndTenantId(id, tenant.getId()).orElse(null);
                    if (cc != null) {
                        cc.setIsBlacklisted(false);
                        cc.setBlacklistReason(null);
                        cc.setBlacklistedBy(null);
                        cc.setBlacklistedDate(null);
                        clientContactRepository.save(cc);
                        count++;
                    }
                    break;

                case "vendors":
                    AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId()).orElse(null);
                    if (vendor != null) {
                        vendor.setIsBlacklisted(false);
                        vendor.setBlacklistReason(null);
                        vendor.setBlacklistedBy(null);
                        vendor.setBlacklistedDate(null);
                        vendorRepository.save(vendor);
                        count++;
                    }
                    break;

                case "vendor_contacts":
                    AtsVendorContact vc = vendorContactRepository.findByIdAndTenantId(id, tenant.getId()).orElse(null);
                    if (vc != null) {
                        vc.setIsBlacklisted(false);
                        vc.setBlacklistReason(null);
                        vc.setBlacklistedBy(null);
                        vc.setBlacklistedDate(null);
                        vendorContactRepository.save(vc);
                        count++;
                    }
                    break;
            }
        }
        return count;
    }

    public void block(String type, Long id, String reason) {
        Tenant tenant = currentTenant();
        String username = currentUsername();
        OffsetDateTime now = OffsetDateTime.now();

        switch (type.toLowerCase()) {
            case "applicants":
                AtsApplicant applicant = applicantRepository.findByIdAndTenantId(id, tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Applicant not found"));
                applicant.setIsBlacklisted(true);
                applicant.setApplicantStatus(ApplicantStatus.BLACKLISTED);
                applicant.setBlacklistReason(reason);
                applicant.setBlacklistedBy(username);
                applicant.setBlacklistedDate(now);
                applicantRepository.save(applicant);
                break;

            case "clients":
                AtsClient client = clientRepository.findByIdAndTenantId(id, tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Client not found"));
                client.setIsBlacklisted(true);
                client.setBlacklistReason(reason);
                client.setBlacklistedBy(username);
                client.setBlacklistedDate(now);
                clientRepository.save(client);
                break;

            case "client_contacts":
                AtsClientContact cc = clientContactRepository.findByIdAndTenantId(id, tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Client Contact not found"));
                cc.setIsBlacklisted(true);
                cc.setBlacklistReason(reason);
                cc.setBlacklistedBy(username);
                cc.setBlacklistedDate(now);
                clientContactRepository.save(cc);
                break;

            case "vendors":
                AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Vendor not found"));
                vendor.setIsBlacklisted(true);
                vendor.setBlacklistReason(reason);
                vendor.setBlacklistedBy(username);
                vendor.setBlacklistedDate(now);
                vendorRepository.save(vendor);
                break;

            case "vendor_contacts":
                AtsVendorContact vc = vendorContactRepository.findByIdAndTenantId(id, tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Vendor Contact not found"));
                vc.setIsBlacklisted(true);
                vc.setBlacklistReason(reason);
                vc.setBlacklistedBy(username);
                vc.setBlacklistedDate(now);
                vendorContactRepository.save(vc);
                break;
        }
    }
}
