package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsApplicantLanguageRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantLanguageResponse;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.entity.AtsApplicantLanguage;
import com.example.multi_tanent.ats.repository.AtsApplicantLanguageRepository;
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
public class AtsApplicantLanguageService {

    private final AtsApplicantLanguageRepository languageRepository;
    private final AtsApplicantRepository applicantRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsApplicantLanguageResponse create(Long applicantId, AtsApplicantLanguageRequest request) {
        Tenant tenant = currentTenant();

        AtsApplicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        AtsApplicantLanguage language = AtsApplicantLanguage.builder()
                .tenant(tenant)
                .applicant(applicant)
                .languageName(request.getLanguageName())
                .canRead(request.getCanRead())
                .canSpeak(request.getCanSpeak())
                .canWrite(request.getCanWrite())
                .build();

        AtsApplicantLanguage saved = languageRepository.save(language);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsApplicantLanguageResponse> getAllForApplicant(Long applicantId) {
        Tenant tenant = currentTenant();
        if (!applicantRepository.existsById(applicantId)) {
            throw new EntityNotFoundException("Applicant not found with id: " + applicantId);
        }
        return languageRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantLanguageResponse getById(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        return languageRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Language not found with id: " + id));
    }

    public AtsApplicantLanguageResponse update(Long applicantId, Long id, AtsApplicantLanguageRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicantLanguage language = languageRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Language not found with id: " + id));

        language.setLanguageName(request.getLanguageName());
        language.setCanRead(request.getCanRead());
        language.setCanSpeak(request.getCanSpeak());
        language.setCanWrite(request.getCanWrite());

        AtsApplicantLanguage updated = languageRepository.save(language);
        return toResponse(updated);
    }

    public void delete(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        AtsApplicantLanguage language = languageRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Language not found with id: " + id));
        languageRepository.delete(language);
    }

    public AtsApplicantLanguageResponse toResponse(AtsApplicantLanguage language) {
        return AtsApplicantLanguageResponse.builder()
                .id(language.getId())
                .applicantId(language.getApplicant().getId())
                .languageName(language.getLanguageName())
                .canRead(language.getCanRead())
                .canSpeak(language.getCanSpeak())
                .canWrite(language.getCanWrite())
                .build();
    }
}
