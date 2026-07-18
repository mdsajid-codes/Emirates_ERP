package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorContactResponse;
import com.example.multi_tanent.ats.entity.AtsVendorContact;
import com.example.multi_tanent.ats.repository.AtsVendorContactRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ats/vendor-contacts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorContactSearchController {

    private final AtsVendorContactRepository contactRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AtsVendorContactResponse>> search(@RequestParam String q) {
        Tenant tenant = currentTenant();
        List<AtsVendorContact> contacts = contactRepository.searchContacts(tenant.getId(), q);

        List<AtsVendorContactResponse> response = contacts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private AtsVendorContactResponse toResponse(AtsVendorContact c) {
        return AtsVendorContactResponse.builder()
                .id(c.getId())
                .vendorId(c.getVendor() != null ? c.getVendor().getId() : null)
                .vendorName(c.getVendor() != null ? c.getVendor().getCompanyName() : null)
                .isPrimary(c.getIsPrimary())
                .salutation(c.getSalutation())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .title(c.getTitle())
                .designation(c.getDesignation())
                .email(c.getEmail())
                .phone(c.getPhone())
                .phoneExtension(c.getPhoneExtension())
                .mobile(c.getMobile())
                .countryId(c.getCountry() != null ? c.getCountry().getId() : null)
                .countryName(c.getCountry() != null ? c.getCountry().getName() : null)
                .stateId(c.getState() != null ? c.getState().getId() : null)
                .stateName(c.getState() != null ? c.getState().getName() : null)
                .city(c.getCity())
                .zipCode(c.getZipCode())
                .linkedinUrl(c.getLinkedinUrl())
                .facebookUrl(c.getFacebookUrl())
                .twitterUrl(c.getTwitterUrl())
                .googlePlusUrl(c.getGooglePlusUrl())
                .status(c.getStatus())
                .technologies(c.getTechnologies())
                .ownerId(c.getOwner() != null ? c.getOwner().getId() : null)
                .ownerName(c.getOwner() != null ? (c.getOwner().getFirstName() + " " + c.getOwner().getLastName()) : null)
                .allowAccessToAllUsers(c.getAllowAccessToAllUsers())
                .comment(c.getComment())
                .sendRequirement(c.getSendRequirement())
                .sendHotlist(c.getSendHotlist())
                .vendorContactType(c.getVendorContactType())
                .vendorGroup(c.getVendorGroup())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
