package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.RackRequest;
import com.example.multi_tanent.warehouse.dto.RackResponse;
import com.example.multi_tanent.warehouse.entity.Rack;
import com.example.multi_tanent.warehouse.entity.Zone;
import com.example.multi_tanent.warehouse.enums.RackType;
import com.example.multi_tanent.warehouse.repository.RackRepository;
import com.example.multi_tanent.warehouse.repository.ZoneRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
@Slf4j
public class RackService {

    private final RackRepository rackRepository;
    private final ZoneRepository zoneRepository;
    private final TenantRepository tenantRepository;
    private final WareBarcodeService barcodeService;
    private final WareStorageService storageService;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public List<RackResponse> getAllRacks() {
        Tenant tenant = getCurrentTenant();
        return rackRepository.findByZoneWarehouseEnterpriseId(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RackResponse getById(Long id) {
        Tenant tenant = getCurrentTenant();
        return rackRepository.findByIdAndZoneWarehouseEnterpriseId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Rack not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<RackResponse> fetchByActive(Boolean isActive) {
        Tenant tenant = getCurrentTenant();
        return rackRepository.findByIsActiveAndZoneWarehouseEnterpriseId(isActive, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RackResponse> fetchByRackType(RackType rackType) {
        Tenant tenant = getCurrentTenant();
        return rackRepository.findByRackTypeAndZoneWarehouseEnterpriseId(rackType, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RackResponse fetchByBarcodeTag(String barcodeTag) {
        Tenant tenant = getCurrentTenant();
        return rackRepository.findByBarcodeTagAndZoneWarehouseEnterpriseId(barcodeTag, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Rack not found with barcodeTag: " + barcodeTag));
    }

    public RackResponse create(RackRequest request) {
        Tenant tenant = getCurrentTenant();
        Zone zone = zoneRepository.findByIdAndWarehouseEnterpriseId(request.getZoneId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + request.getZoneId()));

        String barcodeTag = request.getBarcodeTag();
        if (barcodeTag == null || barcodeTag.isBlank()) {
            barcodeTag = generateAutoBarcode(request.getRackCode());
        }

        Rack rack = Rack.builder()
                .zone(zone)
                .rackCode(request.getRackCode())
                .barcodeTag(barcodeTag)
                .rackType(request.getRackType())
                .aisle(request.getAisle())
                .pickSequence(request.getPickSequence())
                .maxWeight(request.getMaxWeight())
                .maxVolume(request.getMaxVolume())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .description(request.getDescription())
                .build();

        generateAndSetBarcodeImage(rack, tenant.getTenantId());

        return toResponse(rackRepository.save(rack));
    }

    public RackResponse update(Long id, RackRequest request) {
        Tenant tenant = getCurrentTenant();
        Rack rack = rackRepository.findByIdAndZoneWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Rack not found with id: " + id));

        Zone zone = zoneRepository.findByIdAndWarehouseEnterpriseId(request.getZoneId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + request.getZoneId()));

        boolean barcodeChanged = false;
        String newBarcodeTag = request.getBarcodeTag();
        if (newBarcodeTag != null && !newBarcodeTag.isBlank() && !newBarcodeTag.equals(rack.getBarcodeTag())) {
            rack.setBarcodeTag(newBarcodeTag);
            barcodeChanged = true;
        } else if (newBarcodeTag == null || newBarcodeTag.isBlank()) {
            if (rack.getBarcodeTag() == null || rack.getBarcodeTag().isBlank()) {
                rack.setBarcodeTag(generateAutoBarcode(request.getRackCode()));
                barcodeChanged = true;
            }
        }

        rack.setZone(zone);
        rack.setRackCode(request.getRackCode());
        rack.setRackType(request.getRackType());
        rack.setAisle(request.getAisle());
        rack.setPickSequence(request.getPickSequence());
        rack.setMaxWeight(request.getMaxWeight());
        rack.setMaxVolume(request.getMaxVolume());
        rack.setIsActive(request.getIsActive());
        rack.setDescription(request.getDescription());

        if (barcodeChanged || rack.getBarcodeImageUrl() == null) {
            generateAndSetBarcodeImage(rack, tenant.getTenantId());
        }

        return toResponse(rackRepository.save(rack));
    }

    public void delete(Long id) {
        Tenant tenant = getCurrentTenant();
        Rack rack = rackRepository.findByIdAndZoneWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Rack not found with id: " + id));
        rackRepository.delete(rack);
    }

    private String generateAutoBarcode(String rackCode) {
        return "RCK-" + rackCode + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void generateAndSetBarcodeImage(Rack rack, String tenantId) {
        try {
            byte[] barcodeImage = barcodeService.generateBarcodeImage(rack.getBarcodeTag());
            String imageUrl = storageService.storeRackFile(barcodeImage, rack.getRackCode(), tenantId);
            rack.setBarcodeImageUrl(imageUrl);
        } catch (IOException e) {
            log.error("Failed to generate/store barcode image for rack: {}", rack.getRackCode(), e);
        }
    }

    private RackResponse toResponse(Rack rack) {
        return RackResponse.builder()
                .id(rack.getId())
                .zoneId(rack.getZone().getId())
                .zoneName(rack.getZone().getName())
                .rackCode(rack.getRackCode())
                .barcodeTag(rack.getBarcodeTag())
                .barcodeImageUrl(rack.getBarcodeImageUrl())
                .rackType(rack.getRackType())
                .aisle(rack.getAisle())
                .pickSequence(rack.getPickSequence())
                .maxWeight(rack.getMaxWeight())
                .maxVolume(rack.getMaxVolume())
                .isActive(rack.getIsActive())
                .description(rack.getDescription())
                .build();
    }
}
