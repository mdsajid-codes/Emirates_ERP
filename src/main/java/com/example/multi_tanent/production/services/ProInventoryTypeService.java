package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.ProInventoryTypeDto;
import com.example.multi_tanent.production.dto.ProInventoryTypeRequest;
import com.example.multi_tanent.production.entity.ProInventoryType;
import com.example.multi_tanent.production.repository.ProInventoryTypeRepository;
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
public class ProInventoryTypeService {

    private final ProInventoryTypeRepository inventoryTypeRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    public ProInventoryTypeService(ProInventoryTypeRepository inventoryTypeRepository, TenantRepository tenantRepository, LocationRepository locationRepository) {
        this.inventoryTypeRepository = inventoryTypeRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform operations."));
    }

    public ProInventoryTypeDto createInventoryType(ProInventoryTypeRequest request) {
        Tenant tenant = getCurrentTenant();
        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProInventoryType inventoryType = ProInventoryType.builder()
                .tenant(tenant)
                .location(location)
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .build();
        ProInventoryType saved = inventoryTypeRepository.save(inventoryType);
        return toDto(saved);
    }

    public List<ProInventoryTypeDto> getAllInventoryTypes() {
        return inventoryTypeRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProInventoryTypeDto getInventoryTypeById(Long id) {
        return inventoryTypeRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Inventory Type not found with id: " + id));
    }

    public ProInventoryTypeDto updateInventoryType(Long id, ProInventoryTypeRequest request) {
        ProInventoryType inventoryType = inventoryTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory Type not found with id: " + id));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        inventoryType.setName(request.getName());
        inventoryType.setDescription(request.getDescription());
        inventoryType.setLocation(location);

        ProInventoryType updated = inventoryTypeRepository.save(inventoryType);
        return toDto(updated);
    }

    public void deleteInventoryType(Long id) {
        if (!inventoryTypeRepository.existsById(id)) {
            throw new EntityNotFoundException("Inventory Type not found with id: " + id);
        }
        inventoryTypeRepository.deleteById(id);
    }

    private ProInventoryTypeDto toDto(ProInventoryType entity) {
        ProInventoryTypeDto dto = new ProInventoryTypeDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }
        return dto;
    }
}
