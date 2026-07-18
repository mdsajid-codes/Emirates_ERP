package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsPaymentTermsRequest;
import com.example.multi_tanent.ats.dto.AtsPaymentTermsResponse;
import com.example.multi_tanent.ats.entity.AtsPaymentTerms;
import com.example.multi_tanent.ats.repository.AtsPaymentTermsRepository;
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
public class AtsPaymentTermsService {

    private final AtsPaymentTermsRepository paymentTermsRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsPaymentTermsResponse create(AtsPaymentTermsRequest request) {
        Tenant tenant = currentTenant();

        if (paymentTermsRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Payment term with name '" + request.getName() + "' already exists for this tenant.");
        }

        AtsPaymentTerms paymentTerms = AtsPaymentTerms.builder()
                .tenant(tenant)
                .name(request.getName())
                .description(request.getDescription())
                .days(request.getDays())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        AtsPaymentTerms saved = paymentTermsRepository.save(paymentTerms);
        return toResponse(saved);
    }

    public AtsPaymentTermsResponse update(Long id, AtsPaymentTermsRequest request) {
        Tenant tenant = currentTenant();
        AtsPaymentTerms paymentTerms = paymentTermsRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Payment term not found with id " + id));

        if (!paymentTerms.getName().equalsIgnoreCase(request.getName())
                && paymentTermsRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Payment term with name '" + request.getName() + "' already exists for this tenant.");
        }

        paymentTerms.setName(request.getName());
        paymentTerms.setDescription(request.getDescription());
        paymentTerms.setDays(request.getDays());
        if (request.getIsActive() != null) {
            paymentTerms.setIsActive(request.getIsActive());
        }

        AtsPaymentTerms updated = paymentTermsRepository.save(paymentTerms);
        return toResponse(updated);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsPaymentTermsResponse> getPage(Pageable pageable) {
        Tenant tenant = currentTenant();
        return paymentTermsRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsPaymentTermsResponse> getAll() {
        Tenant tenant = currentTenant();
        return paymentTermsRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsPaymentTermsResponse> getAllActive() {
        Tenant tenant = currentTenant();
        return paymentTermsRepository.findByTenantIdAndIsActiveTrue(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsPaymentTermsResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsPaymentTerms paymentTerms = paymentTermsRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Payment term not found with id " + id));
        return toResponse(paymentTerms);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsPaymentTerms paymentTerms = paymentTermsRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Payment term not found with id " + id));
        paymentTermsRepository.delete(paymentTerms);
    }

    public AtsPaymentTermsResponse toggleActive(Long id) {
        Tenant tenant = currentTenant();
        AtsPaymentTerms paymentTerms = paymentTermsRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Payment term not found with id " + id));
        paymentTerms.setIsActive(!paymentTerms.getIsActive());
        AtsPaymentTerms updated = paymentTermsRepository.save(paymentTerms);
        return toResponse(updated);
    }

    public AtsPaymentTermsResponse toResponse(AtsPaymentTerms paymentTerms) {
        if (paymentTerms == null) return null;
        return AtsPaymentTermsResponse.builder()
                .id(paymentTerms.getId())
                .name(paymentTerms.getName())
                .description(paymentTerms.getDescription())
                .days(paymentTerms.getDays())
                .isActive(paymentTerms.getIsActive())
                .createdAt(paymentTerms.getCreatedAt())
                .updatedAt(paymentTerms.getUpdatedAt())
                .build();
    }
}
