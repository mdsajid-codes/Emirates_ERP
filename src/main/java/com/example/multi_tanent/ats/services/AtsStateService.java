package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsStateRequest;
import com.example.multi_tanent.ats.dto.AtsStateResponse;
import com.example.multi_tanent.ats.entity.AtsCountry;
import com.example.multi_tanent.ats.entity.AtsState;
import com.example.multi_tanent.ats.repository.AtsCountryRepository;
import com.example.multi_tanent.ats.repository.AtsStateRepository;
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
public class AtsStateService {

    private final AtsStateRepository stateRepository;
    private final AtsCountryRepository countryRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsStateResponse create(AtsStateRequest request) {
        Tenant tenant = currentTenant();

        AtsCountry country = countryRepository.findByIdAndTenantId(request.getCountryId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + request.getCountryId()));

        if (stateRepository.existsByNameAndCountryIdAndTenantId(request.getName(), country.getId(), tenant.getId())) {
            throw new IllegalArgumentException("State with name '" + request.getName() + "' already exists for this country and tenant.");
        }

        AtsState state = AtsState.builder()
                .tenant(tenant)
                .country(country)
                .name(request.getName())
                .stateCode(request.getStateCode())
                .build();

        AtsState saved = stateRepository.save(state);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsStateResponse> getAll(Pageable pageable) {
        Tenant tenant = currentTenant();
        return stateRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsStateResponse> listAll() {
        Tenant tenant = currentTenant();
        return stateRepository.findByTenantId(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsStateResponse getById(Long id) {
        Tenant tenant = currentTenant();
        return stateRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + id));
    }

    public AtsStateResponse update(Long id, AtsStateRequest request) {
        Tenant tenant = currentTenant();
        AtsState state = stateRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + id));

        AtsCountry country = countryRepository.findByIdAndTenantId(request.getCountryId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + request.getCountryId()));

        if ((!state.getName().equalsIgnoreCase(request.getName()) || !state.getCountry().getId().equals(country.getId()))
                && stateRepository.existsByNameAndCountryIdAndTenantId(request.getName(), country.getId(), tenant.getId())) {
            throw new IllegalArgumentException("State with name '" + request.getName() + "' already exists for this country and tenant.");
        }

        state.setCountry(country);
        state.setName(request.getName());
        state.setStateCode(request.getStateCode());

        AtsState updated = stateRepository.save(state);
        return toResponse(updated);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsState state = stateRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + id));
        stateRepository.delete(state);
    }

    private AtsStateResponse toResponse(AtsState state) {
        return AtsStateResponse.builder()
                .id(state.getId())
                .countryId(state.getCountry().getId())
                .countryName(state.getCountry().getName())
                .name(state.getName())
                .stateCode(state.getStateCode())
                .build();
    }
}
