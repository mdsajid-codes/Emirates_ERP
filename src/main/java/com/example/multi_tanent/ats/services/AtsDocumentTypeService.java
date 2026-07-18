package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsDocumentTypeRequest;
import com.example.multi_tanent.ats.dto.AtsDocumentTypeResponse;
import com.example.multi_tanent.ats.entity.AtsDocumentType;
import com.example.multi_tanent.ats.repository.AtsDocumentTypeRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsDocumentTypeService {

    private final AtsDocumentTypeRepository documentTypeRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsDocumentTypeResponse create(AtsDocumentTypeRequest request) {
        Tenant tenant = currentTenant();

        if (documentTypeRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Document type with name '" + request.getName() + "' already exists for this tenant.");
        }

        AtsDocumentType documentType = AtsDocumentType.builder()
                .tenant(tenant)
                .name(request.getName())
                .build();

        AtsDocumentType saved = documentTypeRepository.save(documentType);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsDocumentTypeResponse> getAll(Pageable pageable) {
        Tenant tenant = currentTenant();
        return documentTypeRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsDocumentTypeResponse> listAll() {
        Tenant tenant = currentTenant();
        return documentTypeRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsDocumentTypeResponse getById(Long id) {
        Tenant tenant = currentTenant();
        return documentTypeRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Document type not found with id: " + id));
    }

    public AtsDocumentTypeResponse update(Long id, AtsDocumentTypeRequest request) {
        Tenant tenant = currentTenant();
        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document type not found with id: " + id));

        if (!documentType.getName().equalsIgnoreCase(request.getName())
                && documentTypeRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Document type with name '" + request.getName() + "' already exists for this tenant.");
        }

        documentType.setName(request.getName());

        AtsDocumentType updated = documentTypeRepository.save(documentType);
        return toResponse(updated);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document type not found with id: " + id));
        documentTypeRepository.delete(documentType);
    }

    private AtsDocumentTypeResponse toResponse(AtsDocumentType documentType) {
        return AtsDocumentTypeResponse.builder()
                .id(documentType.getId())
                .name(documentType.getName())
                .build();
    }
}
