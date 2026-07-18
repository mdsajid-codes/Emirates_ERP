package com.example.multi_tanent.production.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProTaxRequest;
import com.example.multi_tanent.production.dto.ProTaxResponse;
import com.example.multi_tanent.production.entity.ProTax;
import com.example.multi_tanent.production.repository.ProTaxRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
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
public class ProTaxService {

    private final ProTaxRepository taxRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public ProTaxResponse create(ProTaxRequest request) {
        Tenant tenant = getCurrentTenant();
        if (taxRepository.existsByTenantIdAndCodeIgnoreCase(tenant.getId(), request.getCode())) {
            throw new IllegalArgumentException("Tax with code '" + request.getCode() + "' already exists.");
        }

        ProTax tax = new ProTax();
        mapRequestToEntity(request, tax, tenant);
        return ProTaxResponse.fromEntity(taxRepository.save(tax));
    }

    @Transactional(readOnly = true)
    public List<ProTaxResponse> getAll() {
        Long tenantId = getCurrentTenant().getId();
        return taxRepository.findByTenantIdOrderByCodeAsc(tenantId)
                .stream()
                .map(ProTaxResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProTaxResponse update(Long id, ProTaxRequest request) {
        Tenant tenant = getCurrentTenant();
        ProTax tax = taxRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Tax not found with id: " + id));

        if (!tax.getCode().equalsIgnoreCase(request.getCode()) &&
            taxRepository.existsByTenantIdAndCodeIgnoreCase(tenant.getId(), request.getCode())) {
            throw new IllegalArgumentException("Tax with code '" + request.getCode() + "' already exists.");
        }

        mapRequestToEntity(request, tax, tenant);
        return ProTaxResponse.fromEntity(taxRepository.save(tax));
    }

    public void delete(Long id) {
        if (!taxRepository.existsById(id)) {
            throw new EntityNotFoundException("Tax not found with id: " + id);
        }
        taxRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProTaxRequest request, ProTax entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setCode(request.getCode());
        entity.setRate(request.getRate());
        entity.setDescription(request.getDescription());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
            entity.setLocation(location);
        } else {
            entity.setLocation(null);
        }
    }
}