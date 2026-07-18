package com.example.multi_tanent.crm.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CompanyTypeDto;
import com.example.multi_tanent.crm.dto.CompanyTypeRequest;
import com.example.multi_tanent.crm.entity.CompanyType;
import com.example.multi_tanent.crm.repository.CrmCompanyTypeRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmCompanyTypeService {

    private final CrmCompanyTypeRepository companyTypeRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    private Tenant getCurrentTenant() {
        // Use the TenantContext to get the current tenant from the JWT
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB for tenantId: " + tenantId));
    }

    public List<CompanyTypeDto> getAllCompanyTypes() {
        Tenant tenant = getCurrentTenant();
        return companyTypeRepository.findByTenantIdOrderByNameAsc(tenant.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CompanyTypeDto getCompanyTypeById(Long id) {
        Tenant tenant = getCurrentTenant();
        return companyTypeRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Company type not found with id: " + id));
    }

    public CompanyTypeDto createCompanyType(CompanyTypeRequest request) {
        Tenant tenant = getCurrentTenant();

        if (companyTypeRepository.existsByTenantIdAndNameIgnoreCase(tenant.getId(), request.getName())) {
            throw new IllegalArgumentException("Company type already exists for this tenant");
        }

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        CompanyType companyType = CompanyType.builder()
                .tenant(tenant)
                .location(location)
                .name(request.getName().trim())
                .build();

        return toDto(companyTypeRepository.save(companyType));
    }

    public CompanyTypeDto updateCompanyType(Long id, CompanyTypeRequest request) {
        Tenant tenant = getCurrentTenant();
        CompanyType companyType = companyTypeRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Company type not found with id: " + id));

        String newName = request.getName().trim();
        if (!companyType.getName().equalsIgnoreCase(newName)
                && companyTypeRepository.existsByTenantIdAndNameIgnoreCase(tenant.getId(), newName)) {
            throw new IllegalArgumentException("Company type name already exists");
        }

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        companyType.setName(newName);
        companyType.setLocation(location);
        return toDto(companyTypeRepository.save(companyType));
    }

    public void deleteCompanyType(Long id) {
        Tenant tenant = getCurrentTenant();
        CompanyType companyType = companyTypeRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Company type not found with id: " + id));
        companyTypeRepository.delete(companyType);
    }

    private CompanyTypeDto toDto(CompanyType entity) {
        CompanyTypeDto dto = CompanyTypeDto.builder()
                .id(entity.getId()).name(entity.getName())
                .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }
        return dto;
    }
}
