package com.example.multi_tanent.production.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProUnitRequest;
import com.example.multi_tanent.production.dto.ProUnitResponse;
import com.example.multi_tanent.production.entity.ProUnit;
import com.example.multi_tanent.production.repository.ProUnitRepository;
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
public class ProUnitService {

    private final ProUnitRepository unitRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public ProUnitResponse create(ProUnitRequest request) {
        Tenant tenant = getCurrentTenant();
        if (unitRepository.existsByTenantIdAndNameIgnoreCase(tenant.getId(), request.getName())) {
            throw new IllegalArgumentException("Unit with name '" + request.getName() + "' already exists.");
        }

        ProUnit unit = new ProUnit();
        mapRequestToEntity(request, unit, tenant);
        return ProUnitResponse.fromEntity(unitRepository.save(unit));
    }

    @Transactional(readOnly = true)
    public List<ProUnitResponse> getAll() {
        Long tenantId = getCurrentTenant().getId();
        return unitRepository.findByTenantIdOrderByNameAsc(tenantId)
                .stream()
                .map(ProUnitResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProUnitResponse update(Long id, ProUnitRequest request) {
        Tenant tenant = getCurrentTenant();
        ProUnit unit = unitRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found with id: " + id));

        mapRequestToEntity(request, unit, tenant);
        return ProUnitResponse.fromEntity(unitRepository.save(unit));
    }

    public void delete(Long id) {
        if (!unitRepository.existsById(id)) {
            throw new EntityNotFoundException("Unit not found with id: " + id);
        }
        unitRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProUnitRequest request, ProUnit entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setName(request.getName());
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