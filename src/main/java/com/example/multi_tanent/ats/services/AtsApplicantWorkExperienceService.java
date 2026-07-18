package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsApplicantWorkExperienceRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantWorkExperienceResponse;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.entity.AtsApplicantWorkExperience;
import com.example.multi_tanent.ats.repository.AtsApplicantRepository;
import com.example.multi_tanent.ats.repository.AtsApplicantWorkExperienceRepository;
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
public class AtsApplicantWorkExperienceService {

    private final AtsApplicantWorkExperienceRepository workExperienceRepository;
    private final AtsApplicantRepository applicantRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsApplicantWorkExperienceResponse create(Long applicantId, AtsApplicantWorkExperienceRequest request) {
        Tenant tenant = currentTenant();

        AtsApplicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        AtsApplicantWorkExperience workExperience = AtsApplicantWorkExperience.builder()
                .tenant(tenant)
                .applicant(applicant)
                .employerName(request.getEmployerName())
                .jobTitle(request.getJobTitle())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent())
                .location(request.getLocation())
                .description(request.getDescription())
                .build();

        AtsApplicantWorkExperience saved = workExperienceRepository.save(workExperience);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsApplicantWorkExperienceResponse> getAllForApplicant(Long applicantId) {
        Tenant tenant = currentTenant();
        if (!applicantRepository.existsById(applicantId)) {
            throw new EntityNotFoundException("Applicant not found with id: " + applicantId);
        }
        return workExperienceRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantWorkExperienceResponse getById(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        return workExperienceRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("WorkExperience not found with id: " + id));
    }

    public AtsApplicantWorkExperienceResponse update(Long applicantId, Long id, AtsApplicantWorkExperienceRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicantWorkExperience workExperience = workExperienceRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("WorkExperience not found with id: " + id));

        workExperience.setEmployerName(request.getEmployerName());
        workExperience.setJobTitle(request.getJobTitle());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setEndDate(request.getEndDate());
        workExperience.setIsCurrent(request.getIsCurrent());
        workExperience.setLocation(request.getLocation());
        workExperience.setDescription(request.getDescription());

        AtsApplicantWorkExperience updated = workExperienceRepository.save(workExperience);
        return toResponse(updated);
    }

    public void delete(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        AtsApplicantWorkExperience workExperience = workExperienceRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("WorkExperience not found with id: " + id));
        workExperienceRepository.delete(workExperience);
    }

    public AtsApplicantWorkExperienceResponse toResponse(AtsApplicantWorkExperience workExperience) {
        return AtsApplicantWorkExperienceResponse.builder()
                .id(workExperience.getId())
                .applicantId(workExperience.getApplicant().getId())
                .employerName(workExperience.getEmployerName())
                .jobTitle(workExperience.getJobTitle())
                .startDate(workExperience.getStartDate())
                .endDate(workExperience.getEndDate())
                .isCurrent(workExperience.getIsCurrent())
                .location(workExperience.getLocation())
                .description(workExperience.getDescription())
                .build();
    }
}
