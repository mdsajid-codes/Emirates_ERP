package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsAiProviderRequest;
import com.example.multi_tanent.ats.dto.AtsAiProviderResponse;
import com.example.multi_tanent.ats.entity.AtsAiProvider;
import com.example.multi_tanent.ats.repository.AtsAiProviderRepository;
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
public class AtsAiProviderService {

    private final AtsAiProviderRepository aiProviderRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsAiProviderResponse create(AtsAiProviderRequest request) {
        Tenant tenant = currentTenant();

        if (aiProviderRepository.existsByProviderNameAndTenantId(request.getProviderName(), tenant.getId())) {
            throw new IllegalArgumentException("AI Provider with name '" + request.getProviderName() + "' already exists for this tenant.");
        }

        // If it's the first provider for this tenant, set it to active automatically
        boolean shouldBeActive = aiProviderRepository.findByTenantId(tenant.getId()).isEmpty();

        AtsAiProvider provider = AtsAiProvider.builder()
                .tenant(tenant)
                .providerName(request.getProviderName())
                .providerType(request.getProviderType())
                .apiKey(request.getApiKey())
                .model(request.getModel())
                .baseUrl(request.getBaseUrl())
                .maxTokens(request.getMaxTokens() != null ? request.getMaxTokens() : 4096)
                .temperature(request.getTemperature() != null ? request.getTemperature() : 0.0)
                .isActive(shouldBeActive)
                .isEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true)
                .description(request.getDescription())
                .build();

        AtsAiProvider saved = aiProviderRepository.save(provider);
        return toResponse(saved);
    }

    public AtsAiProviderResponse update(Long id, AtsAiProviderRequest request) {
        Tenant tenant = currentTenant();
        AtsAiProvider provider = aiProviderRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("AI Provider not found with id " + id));

        provider.setProviderName(request.getProviderName());
        provider.setProviderType(request.getProviderType());
        // Only update API key if not masked placeholder or if explicitly changed
        if (!request.getApiKey().contains("••••")) {
            provider.setApiKey(request.getApiKey());
        }
        provider.setModel(request.getModel());
        provider.setBaseUrl(request.getBaseUrl());
        if (request.getMaxTokens() != null) provider.setMaxTokens(request.getMaxTokens());
        if (request.getTemperature() != null) provider.setTemperature(request.getTemperature());
        if (request.getIsEnabled() != null) provider.setIsEnabled(request.getIsEnabled());
        provider.setDescription(request.getDescription());

        AtsAiProvider saved = aiProviderRepository.save(provider);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsAiProviderResponse> getPage(Pageable pageable) {
        Tenant tenant = currentTenant();
        return aiProviderRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsAiProviderResponse> getAll() {
        Tenant tenant = currentTenant();
        return aiProviderRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsAiProviderResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsAiProvider provider = aiProviderRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("AI Provider not found with id " + id));
        return toResponse(provider);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsAiProvider provider = aiProviderRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("AI Provider not found with id " + id));
        aiProviderRepository.delete(provider);
    }

    public AtsAiProviderResponse setActive(Long id) {
        Tenant tenant = currentTenant();
        List<AtsAiProvider> allProviders = aiProviderRepository.findByTenantId(tenant.getId());
        
        AtsAiProvider target = null;
        for (AtsAiProvider provider : allProviders) {
            if (provider.getId().equals(id)) {
                provider.setIsActive(true);
                target = provider;
            } else {
                provider.setIsActive(false);
            }
        }

        if (target == null) {
            throw new EntityNotFoundException("AI Provider not found with id " + id);
        }

        aiProviderRepository.saveAll(allProviders);
        return toResponse(target);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsAiProvider getActiveProvider() {
        Tenant tenant = currentTenant();
        return aiProviderRepository.findByTenantIdAndIsActiveTrue(tenant.getId())
                .orElseThrow(() -> new IllegalStateException("No active AI Provider configured for tenant: " + tenant.getName()));
    }

    private AtsAiProviderResponse toResponse(AtsAiProvider provider) {
        String originalKey = provider.getApiKey();
        String maskedKey = "";
        if (originalKey != null && originalKey.length() > 8) {
            maskedKey = originalKey.substring(0, 4) + "••••••••" + originalKey.substring(originalKey.length() - 4);
        } else {
            maskedKey = "••••••••";
        }

        return AtsAiProviderResponse.builder()
                .id(provider.getId())
                .providerName(provider.getProviderName())
                .providerType(provider.getProviderType())
                .apiKeyMasked(maskedKey)
                .model(provider.getModel())
                .baseUrl(provider.getBaseUrl())
                .maxTokens(provider.getMaxTokens())
                .temperature(provider.getTemperature())
                .isActive(provider.getIsActive())
                .isEnabled(provider.getIsEnabled())
                .description(provider.getDescription())
                .createdAt(provider.getCreatedAt())
                .updatedAt(provider.getUpdatedAt())
                .build();
    }
}
