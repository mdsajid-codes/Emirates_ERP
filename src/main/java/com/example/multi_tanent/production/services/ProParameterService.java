package com.example.multi_tanent.production.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProParameterRequest;
import com.example.multi_tanent.production.dto.ProParameterResponse;
import com.example.multi_tanent.production.entity.ProParameter;
import com.example.multi_tanent.production.entity.ProParameterValue;
import com.example.multi_tanent.production.repository.ProParameterRepository;
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
public class ProParameterService {

    private final ProParameterRepository parameterRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public ProParameterResponse create(ProParameterRequest request) {
        Tenant tenant = getCurrentTenant();
        ProParameter parameter = new ProParameter();
        mapRequestToEntity(request, parameter, tenant);
        return ProParameterResponse.fromEntity(parameterRepository.save(parameter));
    }

    @Transactional(readOnly = true)
    public List<ProParameterResponse> getAll() {
        Long tenantId = getCurrentTenant().getId();
        return parameterRepository.findByTenantIdOrderByNameAsc(tenantId)
                .stream()
                .map(ProParameterResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProParameterResponse update(Long id, ProParameterRequest request) {
        Tenant tenant = getCurrentTenant();
        ProParameter parameter = parameterRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Parameter not found with id: " + id));

        mapRequestToEntity(request, parameter, tenant);
        return ProParameterResponse.fromEntity(parameterRepository.save(parameter));
    }

    public void delete(Long id) {
        if (!parameterRepository.existsById(id)) {
            throw new EntityNotFoundException("Parameter not found with id: " + id);
        }
        parameterRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProParameterRequest request, ProParameter entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setName(request.getName());
        entity.setChangesQuantity(request.isChangesQuantity());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
            entity.setLocation(location);
        } else {
            entity.setLocation(null);
        }

        // Handle values
        entity.getValues().clear();
        if (request.getValues() != null) {
            request.getValues().forEach(valueRequest -> {
                ProParameterValue newValue = new ProParameterValue();
                newValue.setTenant(tenant);
                newValue.setParameter(entity);
                newValue.setCode(valueRequest.getCode());
                newValue.setValue(valueRequest.getValue());
                entity.getValues().add(newValue);
            });
        }
    }
}