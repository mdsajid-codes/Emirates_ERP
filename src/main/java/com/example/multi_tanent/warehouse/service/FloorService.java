package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.FloorRequest;
import com.example.multi_tanent.warehouse.dto.FloorResponse;
import com.example.multi_tanent.warehouse.entity.Floor;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.repository.FloorRepository;
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
public class FloorService {

    private final FloorRepository floorRepository;
    private final WareHouseRepository warehouseRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public List<FloorResponse> getAllFloors() {
        Tenant tenant = getCurrentTenant();
        return floorRepository.findByWarehouseEnterpriseId(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FloorResponse getById(Long id) {
        Tenant tenant = getCurrentTenant();
        return floorRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Floor not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<FloorResponse> fetchByActive(Boolean isActive) {
        Tenant tenant = getCurrentTenant();
        return floorRepository.findByIsActiveAndWarehouseEnterpriseId(isActive, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FloorResponse> fetchByWarehouse(Long warehouseId) {
        Tenant tenant = getCurrentTenant();
        return floorRepository.findByWarehouseIdAndWarehouseEnterpriseId(warehouseId, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FloorResponse create(FloorRequest request) {
        Tenant tenant = getCurrentTenant();
        WareHouse warehouse = warehouseRepository.findByIdAndEnterpriseId(request.getWarehouseId(), tenant.getId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        Floor floor = Floor.builder()
                .warehouse(warehouse)
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .levelNo(request.getLevelNo())
                .length(request.getLength())
                .width(request.getWidth())
                .height(request.getHeight())
                .accessType(request.getAccessType())
                .temperatureControlled(request.getTemperatureControlled())
                .minTemp(request.getMinTemp())
                .maxTemp(request.getMaxTemp())
                .hazardousAllowed(request.getHazardousAllowed())
                .restrictedAccess(request.getRestrictedAccess())
                .isDefaultFloor(request.getIsDefaultFloor())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return toResponse(floorRepository.save(floor));
    }

    public FloorResponse update(Long id, FloorRequest request) {
        Tenant tenant = getCurrentTenant();
        Floor floor = floorRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Floor not found with id: " + id));

        WareHouse warehouse = warehouseRepository.findByIdAndEnterpriseId(request.getWarehouseId(), tenant.getId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        floor.setWarehouse(warehouse);
        floor.setCode(request.getCode());
        floor.setName(request.getName());
        floor.setDescription(request.getDescription());
        floor.setLevelNo(request.getLevelNo());
        floor.setLength(request.getLength());
        floor.setWidth(request.getWidth());
        floor.setHeight(request.getHeight());
        floor.setAccessType(request.getAccessType());
        floor.setTemperatureControlled(request.getTemperatureControlled());
        floor.setMinTemp(request.getMinTemp());
        floor.setMaxTemp(request.getMaxTemp());
        floor.setHazardousAllowed(request.getHazardousAllowed());
        floor.setRestrictedAccess(request.getRestrictedAccess());
        floor.setIsDefaultFloor(request.getIsDefaultFloor());
        floor.setIsActive(request.getIsActive());

        return toResponse(floorRepository.save(floor));
    }

    public void delete(Long id) {
        Tenant tenant = getCurrentTenant();
        Floor floor = floorRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Floor not found with id: " + id));
        floorRepository.delete(floor);
    }

    private FloorResponse toResponse(Floor floor) {
        return FloorResponse.builder()
                .id(floor.getId())
                .warehouseId(floor.getWarehouse().getId())
                .warehouseName(floor.getWarehouse().getName())
                .code(floor.getCode())
                .name(floor.getName())
                .description(floor.getDescription())
                .levelNo(floor.getLevelNo())
                .length(floor.getLength())
                .width(floor.getWidth())
                .height(floor.getHeight())
                .accessType(floor.getAccessType())
                .temperatureControlled(floor.getTemperatureControlled())
                .minTemp(floor.getMinTemp())
                .maxTemp(floor.getMaxTemp())
                .hazardousAllowed(floor.getHazardousAllowed())
                .restrictedAccess(floor.getRestrictedAccess())
                .isDefaultFloor(floor.getIsDefaultFloor())
                .isActive(floor.getIsActive())
                .build();
    }
}
