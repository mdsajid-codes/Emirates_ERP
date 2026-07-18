package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorEmailActivityResponse;
import com.example.multi_tanent.ats.entity.AtsVendorEmailActivity;
import com.example.multi_tanent.ats.repository.AtsVendorEmailActivityRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorEmailActivityService {

    private final AtsVendorEmailActivityRepository emailActivityRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorEmailActivityResponse> getAll(Long vendorId) {
        Tenant tenant = currentTenant();
        // verify vendor exists
        vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        return emailActivityRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorEmailActivityResponse getById(Long vendorId, Long activityId) {
        Tenant tenant = currentTenant();
        AtsVendorEmailActivity activity = emailActivityRepository.findByIdAndVendorIdAndTenantId(activityId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Email activity not found"));
        return toResponse(activity);
    }

    private AtsVendorEmailActivityResponse toResponse(AtsVendorEmailActivity e) {
        return AtsVendorEmailActivityResponse.builder()
                .id(e.getId())
                .subject(e.getSubject())
                .body(e.getBody())
                .direction(e.getDirection())
                .fromAddress(e.getFromAddress())
                .toAddresses(e.getToAddresses())
                .ccAddresses(e.getCcAddresses())
                .sentAt(e.getSentAt())
                .linkedById(e.getLinkedBy() != null ? e.getLinkedBy().getId() : null)
                .linkedByName(e.getLinkedBy() != null ? (e.getLinkedBy().getFirstName() + " " + e.getLinkedBy().getLastName()) : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
