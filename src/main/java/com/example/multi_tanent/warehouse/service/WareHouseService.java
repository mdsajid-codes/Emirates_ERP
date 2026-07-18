package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareHouseRequest;
import com.example.multi_tanent.warehouse.dto.WareHouseResponse;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
@Slf4j
public class WareHouseService {

    private final WareHouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public List<WareHouseResponse> getAllWarehouses() {
        Tenant tenant = getCurrentTenant();
        return warehouseRepository.findByEnterpriseId(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WareHouseResponse getById(Long id) {
        Tenant tenant = getCurrentTenant();
        return warehouseRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public WareHouseResponse getByCode(String code) {
        Tenant tenant = getCurrentTenant();
        return warehouseRepository.findByCodeAndEnterpriseId(code, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with code: " + code));
    }

    @Transactional(readOnly = true)
    public List<WareHouseResponse> fetchByActive(Boolean isActive) {
        Tenant tenant = getCurrentTenant();
        return warehouseRepository.findByIsActiveAndEnterpriseId(isActive, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WareHouseResponse> fetchByWarehouseType(WarehouseType warehouseType) {
        Tenant tenant = getCurrentTenant();
        return warehouseRepository.findByWarehouseTypeAndEnterpriseId(warehouseType, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WareHouseResponse create(WareHouseRequest request) {
        Tenant tenant = getCurrentTenant();

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Location not found with id: " + request.getLocationId()));
        }

        WareHouse warehouse = WareHouse.builder()
                .code(request.getCode())
                .name(request.getName())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .qcRequired(request.getQcRequired() != null ? request.getQcRequired() : true)
                .binTrackingEnabled(request.getBinTrackingEnabled() != null ? request.getBinTrackingEnabled() : true)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .description(request.getDescription())
                .warehouseType(request.getWarehouseType())
                .defaultPickStrategy(request.getDefaultPickStrategy())
                .allowNegativeStock(request.getAllowNegativeStock() != null ? request.getAllowNegativeStock() : false)
                .openTime(request.getOpenTime())
                .closeTime(request.getCloseTime())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .totalCapacityWeight(request.getTotalCapacityWeight())
                .totalCapacityVolume(request.getTotalCapacityVolume())
                .location(location)
                .enterprise(tenant)
                .build();

        return toResponse(warehouseRepository.save(warehouse));
    }

    public WareHouseResponse update(Long id, WareHouseRequest request) {
        Tenant tenant = getCurrentTenant();
        WareHouse warehouse = warehouseRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + id));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Location not found with id: " + request.getLocationId()));
        }

        warehouse.setCode(request.getCode());
        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setContactPerson(request.getContactPerson());
        warehouse.setContactPhone(request.getContactPhone());
        warehouse.setContactEmail(request.getContactEmail());
        warehouse.setQcRequired(request.getQcRequired());
        warehouse.setBinTrackingEnabled(request.getBinTrackingEnabled());
        warehouse.setIsActive(request.getIsActive());
        warehouse.setDescription(request.getDescription());
        warehouse.setWarehouseType(request.getWarehouseType());
        warehouse.setDefaultPickStrategy(request.getDefaultPickStrategy());
        warehouse.setAllowNegativeStock(request.getAllowNegativeStock());
        warehouse.setOpenTime(request.getOpenTime());
        warehouse.setCloseTime(request.getCloseTime());
        warehouse.setLatitude(request.getLatitude());
        warehouse.setLongitude(request.getLongitude());
        warehouse.setTotalCapacityWeight(request.getTotalCapacityWeight());
        warehouse.setTotalCapacityVolume(request.getTotalCapacityVolume());
        warehouse.setLocation(location);

        return toResponse(warehouseRepository.save(warehouse));
    }

    public void delete(Long id) {
        Tenant tenant = getCurrentTenant();
        WareHouse warehouse = warehouseRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + id));
        warehouseRepository.delete(warehouse);
    }

    private WareHouseResponse toResponse(WareHouse warehouse) {
        return WareHouseResponse.builder()
                .id(warehouse.getId())
                .code(warehouse.getCode())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .contactPerson(warehouse.getContactPerson())
                .contactPhone(warehouse.getContactPhone())
                .contactEmail(warehouse.getContactEmail())
                .qcRequired(warehouse.getQcRequired())
                .binTrackingEnabled(warehouse.getBinTrackingEnabled())
                .isActive(warehouse.getIsActive())
                .description(warehouse.getDescription())
                .warehouseType(warehouse.getWarehouseType())
                .defaultPickStrategy(warehouse.getDefaultPickStrategy())
                .allowNegativeStock(warehouse.getAllowNegativeStock())
                .openTime(warehouse.getOpenTime())
                .closeTime(warehouse.getCloseTime())
                .latitude(warehouse.getLatitude())
                .longitude(warehouse.getLongitude())
                .totalCapacityWeight(warehouse.getTotalCapacityWeight())
                .totalCapacityVolume(warehouse.getTotalCapacityVolume())
                .locationId(warehouse.getLocation() != null ? warehouse.getLocation().getId() : null)
                .locationName(warehouse.getLocation() != null ? warehouse.getLocation().getName() : null)
                .build();
    }
}
