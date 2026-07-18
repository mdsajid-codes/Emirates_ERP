package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.ProPriceCategoryDto;
import com.example.multi_tanent.production.dto.ProPriceCategoryRequest;
import com.example.multi_tanent.production.entity.ProPriceCategory;
import com.example.multi_tanent.production.repository.ProPriceCategoryRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class ProPriceCategoryService {

    private final ProPriceCategoryRepository priceCategoryRepository;
    private final TenantRepository tenantRepository;
    private final com.example.multi_tanent.spersusers.repository.LocationRepository locationRepository; // Assuming this is the correct LocationRepository

    public ProPriceCategoryService(ProPriceCategoryRepository priceCategoryRepository, TenantRepository tenantRepository, com.example.multi_tanent.spersusers.repository.LocationRepository locationRepository) {
        this.priceCategoryRepository = priceCategoryRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform operations."));
    }

    public ProPriceCategoryDto createPriceCategory(ProPriceCategoryRequest request) {
        Tenant tenant = getCurrentTenant();
        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProPriceCategory priceCategory = ProPriceCategory.builder()
                .tenant(tenant)
                .location(location)
                .name(request.getName())
                .description(request.getDescription())
                .build();
        ProPriceCategory saved = priceCategoryRepository.save(priceCategory);
        return toDto(saved);
    }

    public List<ProPriceCategoryDto> getAllPriceCategories() {
        return priceCategoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProPriceCategoryDto getPriceCategoryById(Long id) {
        return priceCategoryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Price Category not found with id: " + id));
    }

    public ProPriceCategoryDto updatePriceCategory(Long id, ProPriceCategoryRequest request) {
        ProPriceCategory priceCategory = priceCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Price Category not found with id: " + id));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        priceCategory.setName(request.getName());
        priceCategory.setDescription(request.getDescription());
        priceCategory.setLocation(location);


        ProPriceCategory updated = priceCategoryRepository.save(priceCategory);
        return toDto(updated);
    }

    public void deletePriceCategory(Long id) {
        if (!priceCategoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Price Category not found with id: " + id);
        }
        priceCategoryRepository.deleteById(id);
    }

    private ProPriceCategoryDto toDto(ProPriceCategory entity) {
        ProPriceCategoryDto dto = new ProPriceCategoryDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }
        return dto;
    }
}
