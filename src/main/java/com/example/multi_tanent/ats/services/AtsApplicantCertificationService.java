package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsApplicantCertificationRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantCertificationResponse;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.entity.AtsApplicantCertification;
import com.example.multi_tanent.ats.repository.AtsApplicantCertificationRepository;
import com.example.multi_tanent.ats.repository.AtsApplicantRepository;
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
public class AtsApplicantCertificationService {

    private final AtsApplicantCertificationRepository certificationRepository;
    private final AtsApplicantRepository applicantRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsApplicantCertificationResponse create(Long applicantId, AtsApplicantCertificationRequest request) {
        Tenant tenant = currentTenant();

        AtsApplicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        AtsApplicantCertification certification = AtsApplicantCertification.builder()
                .tenant(tenant)
                .applicant(applicant)
                .certificationName(request.getCertificationName())
                .completedDate(request.getCompletedDate())
                .comments(request.getComments())
                .build();

        AtsApplicantCertification saved = certificationRepository.save(certification);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsApplicantCertificationResponse> getAllForApplicant(Long applicantId) {
        Tenant tenant = currentTenant();
        if (!applicantRepository.existsById(applicantId)) {
            throw new EntityNotFoundException("Applicant not found with id: " + applicantId);
        }
        return certificationRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantCertificationResponse getById(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        return certificationRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Certification not found with id: " + id));
    }

    public AtsApplicantCertificationResponse update(Long applicantId, Long id, AtsApplicantCertificationRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicantCertification certification = certificationRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Certification not found with id: " + id));

        certification.setCertificationName(request.getCertificationName());
        certification.setCompletedDate(request.getCompletedDate());
        certification.setComments(request.getComments());

        AtsApplicantCertification updated = certificationRepository.save(certification);
        return toResponse(updated);
    }

    public void delete(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        AtsApplicantCertification certification = certificationRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Certification not found with id: " + id));
        certificationRepository.delete(certification);
    }

    public AtsApplicantCertificationResponse toResponse(AtsApplicantCertification certification) {
        return AtsApplicantCertificationResponse.builder()
                .id(certification.getId())
                .applicantId(certification.getApplicant().getId())
                .certificationName(certification.getCertificationName())
                .completedDate(certification.getCompletedDate())
                .comments(certification.getComments())
                .build();
    }
}
