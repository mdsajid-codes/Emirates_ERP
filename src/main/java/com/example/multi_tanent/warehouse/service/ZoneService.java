package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.ZoneRequest;
import com.example.multi_tanent.warehouse.dto.ZoneResponse;
import com.example.multi_tanent.warehouse.entity.Floor;
import com.example.multi_tanent.warehouse.entity.Zone;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.ZoneType;
import com.example.multi_tanent.warehouse.repository.FloorRepository;
import com.example.multi_tanent.warehouse.repository.ZoneRepository;
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
public class ZoneService {

        private final ZoneRepository zoneRepository;
        private final WareHouseRepository warehouseRepository;
        private final TenantRepository tenantRepository;
        private final FloorRepository floorRepository;

        private Tenant getCurrentTenant() {
                return tenantRepository.findFirstByOrderByIdAsc()
                                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
        }

        @Transactional(readOnly = true)
        public List<ZoneResponse> getAllZones() {
                Tenant tenant = getCurrentTenant();
                return zoneRepository.findByWarehouseEnterpriseId(tenant.getId())
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public ZoneResponse getById(Long id) {
                Tenant tenant = getCurrentTenant();
                return zoneRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                                .map(this::toResponse)
                                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + id));
        }

        @Transactional(readOnly = true)
        public List<ZoneResponse> fetchByActive(Boolean isActive) {
                Tenant tenant = getCurrentTenant();
                return zoneRepository.findByIsActiveAndWarehouseEnterpriseId(isActive, tenant.getId())
                                .stream().map(this::toResponse).collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ZoneResponse> fetchByZoneType(ZoneType zoneType) {
                Tenant tenant = getCurrentTenant();
                return zoneRepository.findByZoneTypeAndWarehouseEnterpriseId(zoneType, tenant.getId())
                                .stream().map(this::toResponse).collect(Collectors.toList());
        }

        public ZoneResponse create(ZoneRequest request) {
                Tenant tenant = getCurrentTenant();
                WareHouse warehouse = warehouseRepository
                                .findByIdAndEnterpriseId(request.getWarehouseId(), tenant.getId())
                                .orElseThrow(
                                                () -> new EntityNotFoundException("Warehouse not found with id: "
                                                                + request.getWarehouseId()));

                Floor floor = null;
                if (request.getFloorId() != null) {
                        floor = floorRepository.findByIdAndWarehouseEnterpriseId(request.getFloorId(), tenant.getId())
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Floor not found with id: " + request.getFloorId()));
                }

                Zone zone = Zone.builder()
                                .warehouse(warehouse)
                                .floor(floor)
                                .name(request.getName())
                                .zoneType(request.getZoneType())
                                .pickPriority(request.getPickPriority())
                                .putAwayPriority(request.getPutAwayPriority())
                                .fastMovingZone(request.getFastMovingZone())
                                .temperatureControlled(request.getTemperatureControlled())
                                .minTemp(request.getMinTemp())
                                .maxTemp(request.getMaxTemp())
                                .hazardousAllowed(request.getHazardous())
                                .hazardClass(request.getHazardClass())
                                .restrictedAccess(request.getRestrictedAccess())
                                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                                .maxWeight(request.getMaxWeight())
                                .maxVolume(request.getMaxVolume())
                                .description(request.getDescription())
                                .build();

                return toResponse(zoneRepository.save(zone));
        }

        public ZoneResponse update(Long id, ZoneRequest request) {
                Tenant tenant = getCurrentTenant();
                Zone zone = zoneRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + id));

                WareHouse warehouse = warehouseRepository
                                .findByIdAndEnterpriseId(request.getWarehouseId(), tenant.getId())
                                .orElseThrow(
                                                () -> new EntityNotFoundException("Warehouse not found with id: "
                                                                + request.getWarehouseId()));

                Floor floor = null;
                if (request.getFloorId() != null) {
                        floor = floorRepository.findByIdAndWarehouseEnterpriseId(request.getFloorId(), tenant.getId())
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Floor not found with id: " + request.getFloorId()));
                }

                zone.setWarehouse(warehouse);
                zone.setFloor(floor);
                zone.setName(request.getName());
                zone.setZoneType(request.getZoneType());
                zone.setPickPriority(request.getPickPriority());
                zone.setPutAwayPriority(request.getPutAwayPriority());
                zone.setFastMovingZone(request.getFastMovingZone());
                zone.setTemperatureControlled(request.getTemperatureControlled());
                zone.setMinTemp(request.getMinTemp());
                zone.setMaxTemp(request.getMaxTemp());
                zone.setHazardousAllowed(request.getHazardous());
                zone.setHazardClass(request.getHazardClass());
                zone.setRestrictedAccess(request.getRestrictedAccess());
                zone.setIsActive(request.getIsActive());
                zone.setMaxWeight(request.getMaxWeight());
                zone.setMaxVolume(request.getMaxVolume());
                zone.setDescription(request.getDescription());

                return toResponse(zoneRepository.save(zone));
        }

        public void delete(Long id) {
                Tenant tenant = getCurrentTenant();
                Zone zone = zoneRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + id));
                zoneRepository.delete(zone);
        }

        private ZoneResponse toResponse(Zone zone) {
                return ZoneResponse.builder()
                                .id(zone.getId())
                                .warehouseId(zone.getWarehouse().getId())
                                .warehouseName(zone.getWarehouse().getName())
                                .floorId(zone.getFloor() != null ? zone.getFloor().getId() : null)
                                .floorName(zone.getFloor() != null ? zone.getFloor().getName() : null)
                                .name(zone.getName())
                                .zoneType(zone.getZoneType())
                                .pickPriority(zone.getPickPriority())
                                .putAwayPriority(zone.getPutAwayPriority())
                                .fastMovingZone(zone.getFastMovingZone())
                                .temperatureControlled(zone.getTemperatureControlled())
                                .minTemp(zone.getMinTemp())
                                .maxTemp(zone.getMaxTemp())
                                .hazardous(zone.getHazardousAllowed())
                                .hazardClass(zone.getHazardClass())
                                .restrictedAccess(zone.getRestrictedAccess())
                                .isActive(zone.getIsActive())
                                .maxWeight(zone.getMaxWeight())
                                .maxVolume(zone.getMaxVolume())
                                .description(zone.getDescription())
                                .build();
        }
}
