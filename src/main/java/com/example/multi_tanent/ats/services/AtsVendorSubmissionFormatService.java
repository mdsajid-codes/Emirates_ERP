package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorSubmissionFormatRequest;
import com.example.multi_tanent.ats.dto.AtsVendorSubmissionFormatResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorSubmissionFormat;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.ats.repository.AtsVendorSubmissionFormatRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorSubmissionFormatService {

    private final AtsVendorSubmissionFormatRepository submissionFormatRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorSubmissionFormatResponse get(Long vendorId) {
        Tenant tenant = currentTenant();
        AtsVendorSubmissionFormat format = submissionFormatRepository.findByVendorIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Submission format template not found for vendor id " + vendorId));
        return toResponse(format);
    }

    public AtsVendorSubmissionFormatResponse upsert(Long vendorId, AtsVendorSubmissionFormatRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        Optional<AtsVendorSubmissionFormat> existingOpt = submissionFormatRepository.findByVendorIdAndTenantId(vendorId, tenant.getId());

        AtsVendorSubmissionFormat format;
        if (existingOpt.isPresent()) {
            format = existingOpt.get();
            format.setSubmissionDescription(request.getSubmissionDescription());
            format.setMailDescription(request.getMailDescription());
            format.setMailingSubject(request.getMailingSubject());
            format.setBody(request.getBody());
        } else {
            format = AtsVendorSubmissionFormat.builder()
                    .tenant(tenant)
                    .vendor(vendor)
                    .submissionDescription(request.getSubmissionDescription())
                    .mailDescription(request.getMailDescription())
                    .mailingSubject(request.getMailingSubject())
                    .body(request.getBody())
                    .build();
        }

        AtsVendorSubmissionFormat saved = submissionFormatRepository.save(format);
        return toResponse(saved);
    }

    public void delete(Long vendorId) {
        Tenant tenant = currentTenant();
        AtsVendorSubmissionFormat format = submissionFormatRepository.findByVendorIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Submission format template not found for vendor id " + vendorId));
        submissionFormatRepository.delete(format);
    }

    private AtsVendorSubmissionFormatResponse toResponse(AtsVendorSubmissionFormat f) {
        return AtsVendorSubmissionFormatResponse.builder()
                .id(f.getId())
                .submissionDescription(f.getSubmissionDescription())
                .mailDescription(f.getMailDescription())
                .mailingSubject(f.getMailingSubject())
                .body(f.getBody())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
