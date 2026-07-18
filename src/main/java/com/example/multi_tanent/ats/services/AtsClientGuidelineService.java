package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientGuidelineRequest;
import com.example.multi_tanent.ats.dto.AtsClientGuidelineResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientGuideline;
import com.example.multi_tanent.ats.repository.AtsClientGuidelineRepository;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
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
public class AtsClientGuidelineService {

    private final AtsClientGuidelineRepository guidelineRepository;
    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientGuidelineResponse get(Long clientId) {
        Tenant tenant = currentTenant();
        return guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .map(this::toResponse)
                .orElse(null);
    }

    public AtsClientGuidelineResponse upsert(Long clientId, AtsClientGuidelineRequest request) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + clientId));

        Optional<AtsClientGuideline> existingOpt = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId());

        AtsClientGuideline guideline;
        if (existingOpt.isPresent()) {
            guideline = existingOpt.get();
            guideline.setSubmissionGuidelines(request.getSubmissionGuidelines());
        } else {
            guideline = AtsClientGuideline.builder()
                    .tenant(tenant)
                    .client(client)
                    .submissionGuidelines(request.getSubmissionGuidelines())
                    .build();
        }

        AtsClientGuideline saved = guidelineRepository.save(guideline);
        return toResponse(saved);
    }

    public void delete(Long clientId) {
        Tenant tenant = currentTenant();
        AtsClientGuideline guideline = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guidelines not found for client id: " + clientId));
        guidelineRepository.delete(guideline);
    }

    public AtsClientGuidelineResponse toResponse(AtsClientGuideline g) {
        return AtsClientGuidelineResponse.builder()
                .id(g.getId())
                .clientId(g.getClient().getId())
                .submissionGuidelines(g.getSubmissionGuidelines())
                .createdAt(g.getCreatedAt())
                .updatedAt(g.getUpdatedAt())
                .build();
    }
}
