package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsCountryRequest;
import com.example.multi_tanent.ats.dto.AtsCountryResponse;
import com.example.multi_tanent.ats.entity.AtsCountry;
import com.example.multi_tanent.ats.repository.AtsCountryRepository;
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
public class AtsCountryService {

    private final AtsCountryRepository countryRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsCountryResponse create(AtsCountryRequest request) {
        Tenant tenant = currentTenant();

        if (countryRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Country with name '" + request.getName() + "' already exists for this tenant.");
        }

        AtsCountry country = AtsCountry.builder()
                .tenant(tenant)
                .name(request.getName())
                .isoCode(request.getIsoCode())
                .build();

        AtsCountry saved = countryRepository.save(country);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsCountryResponse> getAll(Pageable pageable) {
        Tenant tenant = currentTenant();
        return countryRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsCountryResponse> listAll() {
        Tenant tenant = currentTenant();
        return countryRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsCountryResponse getById(Long id) {
        Tenant tenant = currentTenant();
        return countryRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + id));
    }

    public AtsCountryResponse update(Long id, AtsCountryRequest request) {
        Tenant tenant = currentTenant();
        AtsCountry country = countryRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + id));

        if (!country.getName().equalsIgnoreCase(request.getName())
                && countryRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new IllegalArgumentException("Country with name '" + request.getName() + "' already exists for this tenant.");
        }

        country.setName(request.getName());
        country.setIsoCode(request.getIsoCode());

        AtsCountry updated = countryRepository.save(country);
        return toResponse(updated);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsCountry country = countryRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + id));
        countryRepository.delete(country);
    }

    private AtsCountryResponse toResponse(AtsCountry country) {
        return AtsCountryResponse.builder()
                .id(country.getId())
                .name(country.getName())
                .isoCode(country.getIsoCode())
                .build();
    }
}
