package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.sales.dto.SalesDocTemplateRequest;
import com.example.multi_tanent.sales.dto.SalesDocTemplateResponse;
import com.example.multi_tanent.sales.entity.SalesDocTemplate;
import com.example.multi_tanent.sales.enums.SalesDocType;
import com.example.multi_tanent.sales.repository.SalesDocTemplateRepository;
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
public class SalesDocTemplateService {

    private final SalesDocTemplateRepository templateRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public SalesDocTemplateResponse createTemplate(SalesDocTemplateRequest request) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        if (request.isDefault()) {
            // Unset existing default for this doc type
            templateRepository.findByTenantIdAndDocTypeAndIsDefaultTrue(tenant.getId(), request.getDocType())
                    .ifPresent(t -> {
                        t.setDefault(false);
                        templateRepository.save(t);
                    });
        }

        SalesDocTemplate template = new SalesDocTemplate();
        template.setTenant(tenant);
        template.setName(request.getName());
        template.setDocType(request.getDocType());
        template.setTemplateContent(request.getTemplateContent());
        template.setDefault(request.isDefault());

        SalesDocTemplate savedTemplate = templateRepository.save(template);
        return mapToResponse(savedTemplate);
    }

    @Transactional
    public SalesDocTemplateResponse updateTemplate(Long id, SalesDocTemplateRequest request) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesDocTemplate template = templateRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        if (request.isDefault() && !template.isDefault()) {
            // Unset existing default for this doc type
            templateRepository.findByTenantIdAndDocTypeAndIsDefaultTrue(tenant.getId(), request.getDocType())
                    .ifPresent(t -> {
                        t.setDefault(false);
                        templateRepository.save(t);
                    });
        }

        template.setName(request.getName());
        template.setDocType(request.getDocType());
        template.setTemplateContent(request.getTemplateContent());
        template.setDefault(request.isDefault());

        SalesDocTemplate updatedTemplate = templateRepository.save(template);
        return mapToResponse(updatedTemplate);
    }

    @Transactional(readOnly = true)
    public List<SalesDocTemplateResponse> getAllTemplates() {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        return templateRepository.findByTenantId(tenant.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesDocTemplateResponse> getTemplatesByType(SalesDocType docType) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        return templateRepository.findByTenantIdAndDocType(tenant.getId(), docType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesDocTemplateResponse getTemplateById(Long id) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesDocTemplate template = templateRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        return mapToResponse(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesDocTemplate template = templateRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        templateRepository.delete(template);
    }

    @Transactional
    public void setDefaultTemplate(Long id) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesDocTemplate template = templateRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        // Unset existing default for this doc type
        templateRepository.findByTenantIdAndDocTypeAndIsDefaultTrue(tenant.getId(), template.getDocType())
                .ifPresent(t -> {
                    t.setDefault(false);
                    templateRepository.save(t);
                });

        template.setDefault(true);
        templateRepository.save(template);
    }

    private SalesDocTemplateResponse mapToResponse(SalesDocTemplate template) {
        SalesDocTemplateResponse response = new SalesDocTemplateResponse();
        response.setId(template.getId());
        response.setName(template.getName());
        response.setDocType(template.getDocType());
        response.setTemplateContent(template.getTemplateContent());
        response.setDefault(template.isDefault());
        response.setCreatedAt(template.getCreatedAt());
        response.setUpdatedAt(template.getUpdatedAt());
        return response;
    }
}
