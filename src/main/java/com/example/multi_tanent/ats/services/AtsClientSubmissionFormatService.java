package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientSubmissionFormatRequest;
import com.example.multi_tanent.ats.dto.AtsClientSubmissionFormatResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientSubmissionFormat;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
import com.example.multi_tanent.ats.repository.AtsClientSubmissionFormatRepository;
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
public class AtsClientSubmissionFormatService {

    private final AtsClientSubmissionFormatRepository submissionFormatRepository;
    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientSubmissionFormatResponse get(Long clientId) {
        Tenant tenant = currentTenant();
        AtsClientSubmissionFormat format = submissionFormatRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Submission format template not found for client id: " + clientId));
        return toResponse(format);
    }

    public AtsClientSubmissionFormatResponse upsert(Long clientId, AtsClientSubmissionFormatRequest request) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + clientId));

        Optional<AtsClientSubmissionFormat> existingOpt = submissionFormatRepository.findByClientIdAndTenantId(clientId, tenant.getId());

        AtsClientSubmissionFormat format;
        if (existingOpt.isPresent()) {
            format = existingOpt.get();
            format.setMailingSubject(request.getMailingSubject());
            format.setBody(request.getBody());
            format.setExcelFields(request.getExcelFields());
        } else {
            format = AtsClientSubmissionFormat.builder()
                    .tenant(tenant)
                    .client(client)
                    .mailingSubject(request.getMailingSubject())
                    .body(request.getBody())
                    .excelFields(request.getExcelFields())
                    .build();
        }

        AtsClientSubmissionFormat saved = submissionFormatRepository.save(format);
        return toResponse(saved);
    }

    public void delete(Long clientId) {
        Tenant tenant = currentTenant();
        AtsClientSubmissionFormat format = submissionFormatRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Submission format template not found for client id: " + clientId));
        submissionFormatRepository.delete(format);
    }

    private AtsClientSubmissionFormatResponse toResponse(AtsClientSubmissionFormat f) {
        return AtsClientSubmissionFormatResponse.builder()
                .id(f.getId())
                .clientId(f.getClient().getId())
                .mailingSubject(f.getMailingSubject())
                .body(f.getBody())
                .excelFields(f.getExcelFields())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
