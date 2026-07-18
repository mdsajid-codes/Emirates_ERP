package com.example.multi_tanent.crm.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.crm.dto.CrmIndustryDto;
import com.example.multi_tanent.crm.dto.CrmIndustryRequest;
import com.example.multi_tanent.spersusers.enitity.CrmIndustry;
import com.example.multi_tanent.spersusers.repository.CrmIndustryRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmIndustryService {

  private final CrmIndustryRepository industryRepository;
  private final TenantRepository tenantRepository;
  private final LocationRepository locationRepository;

  private Tenant getCurrentTenant() {
    return tenantRepository.findFirstByOrderByIdAsc()
        .orElseThrow(() -> new IllegalStateException("Tenant not found"));
  }

  @Transactional(readOnly = true)
  public List<CrmIndustryDto> getAllIndustries() {
    Tenant t = getCurrentTenant();
    return industryRepository.findByTenantIdOrderByNameAsc(t.getId()).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public CrmIndustryDto getIndustryById(Long id) {
    Tenant t = getCurrentTenant();
    return industryRepository.findByIdAndTenantId(id, t.getId())
        .map(this::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Industry not found with id: " + id));
  }

  public CrmIndustryDto create(CrmIndustryRequest req) {
    Tenant t = getCurrentTenant();
    String name = req.getName().trim();

    if (industryRepository.existsByTenantIdAndNameIgnoreCase(t.getId(), name)) {
      throw new IllegalArgumentException("Industry already exists for this tenant");
    }

    Location location = null;
    if (req.getLocationId() != null) {
      location = locationRepository.findById(req.getLocationId())
          .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + req.getLocationId()));
    }

    CrmIndustry e = CrmIndustry.builder()
        .tenant(t)
        .location(location)
        .name(name)
        .build();
    return toDto(industryRepository.save(e));
  }

  public CrmIndustryDto update(Long id, CrmIndustryRequest req) {
    Tenant t = getCurrentTenant();
    CrmIndustry e = industryRepository.findByIdAndTenantId(id, t.getId())
        .orElseThrow(() -> new EntityNotFoundException("Industry not found with id: " + id));

    String newName = req.getName().trim();
    if (!e.getName().equalsIgnoreCase(newName)
        && industryRepository.existsByTenantIdAndNameIgnoreCase(t.getId(), newName)) {
      throw new IllegalArgumentException("Industry name already exists");
    }

    Location location = null;
    if (req.getLocationId() != null) {
      location = locationRepository.findById(req.getLocationId())
          .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + req.getLocationId()));
    }

    e.setName(newName);
    e.setLocation(location);
    return toDto(industryRepository.save(e));
  }

  public void delete(Long id) {
    Tenant t = getCurrentTenant();
    CrmIndustry e = industryRepository.findByIdAndTenantId(id, t.getId())
        .orElseThrow(() -> new EntityNotFoundException("Industry not found with id: " + id));
    industryRepository.delete(e);
  }

  private CrmIndustryDto toDto(CrmIndustry entity) {
    CrmIndustryDto dto = CrmIndustryDto.builder()
        .id(entity.getId())
        .name(entity.getName())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .build();

    if (entity.getLocation() != null) {
      dto.setLocationId(entity.getLocation().getId());
      dto.setLocationName(entity.getLocation().getName());
    }

    return dto;
  }
}
