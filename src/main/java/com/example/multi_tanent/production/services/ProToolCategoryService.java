package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.ProToolCategoryDto;
import com.example.multi_tanent.production.dto.ProToolCategoryRequest;
import com.example.multi_tanent.production.entity.ProToolCategory;
import com.example.multi_tanent.production.repository.ProToolCategoryRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class ProToolCategoryService {

    private final ProToolCategoryRepository toolCategoryRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    public ProToolCategoryService(ProToolCategoryRepository toolCategoryRepository, TenantRepository tenantRepository, LocationRepository locationRepository) {
        this.toolCategoryRepository = toolCategoryRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform operations."));
    }

    public ProToolCategoryDto createToolCategory(ProToolCategoryRequest request) {
        Tenant tenant = getCurrentTenant();
        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProToolCategory toolCategory = ProToolCategory.builder()
                .tenant(tenant)
                .location(location)
                .name(request.getName())
                .description(request.getDescription())
                .build();
        ProToolCategory saved = toolCategoryRepository.save(toolCategory);
        return toDto(saved);
    }

    public List<ProToolCategoryDto> getAllToolCategories() {
        return toolCategoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProToolCategoryDto getToolCategoryById(Long id) {
        return toolCategoryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Tool Category not found with id: " + id));
    }

    public ProToolCategoryDto updateToolCategory(Long id, ProToolCategoryRequest request) {
        ProToolCategory toolCategory = toolCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tool Category not found with id: " + id));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        toolCategory.setName(request.getName());
        toolCategory.setDescription(request.getDescription());
        toolCategory.setLocation(location);

        ProToolCategory updated = toolCategoryRepository.save(toolCategory);
        return toDto(updated);
    }

    public void deleteToolCategory(Long id) {
        if (!toolCategoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Tool Category not found with id: " + id);
        }
        toolCategoryRepository.deleteById(id);
    }

    private ProToolCategoryDto toDto(ProToolCategory entity) {
        ProToolCategoryDto dto = ProToolCategoryDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();

        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }
        return dto;
    }
}