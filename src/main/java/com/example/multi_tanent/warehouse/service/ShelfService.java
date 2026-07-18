package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.ShelfRequest;
import com.example.multi_tanent.warehouse.dto.ShelfResponse;
import com.example.multi_tanent.warehouse.entity.Rack;
import com.example.multi_tanent.warehouse.entity.Shelf;
import com.example.multi_tanent.warehouse.repository.RackRepository;
import com.example.multi_tanent.warehouse.repository.ShelfRepository;
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
public class ShelfService {

    private final ShelfRepository shelfRepository;
    private final RackRepository rackRepository;
    private final TenantRepository tenantRepository;
    private final WareBarcodeService barcodeService;
    private final WareStorageService storageService;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public List<ShelfResponse> getAllShelves() {
        Tenant tenant = getCurrentTenant();
        return shelfRepository.findByRackZoneWarehouseEnterpriseId(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShelfResponse getShelfById(Long id) {
        Tenant tenant = getCurrentTenant();
        return shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Shelf not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<ShelfResponse> fetchByActive(Boolean isActive) {
        Tenant tenant = getCurrentTenant();
        return shelfRepository.findByIsActiveAndRackZoneWarehouseEnterpriseId(isActive, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShelfResponse fetchByBarcodeTag(String barcodeTag) {
        Tenant tenant = getCurrentTenant();
        return shelfRepository.findByBarcodeTagAndRackZoneWarehouseEnterpriseId(barcodeTag, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Shelf not found with barcodeTag: " + barcodeTag));
    }

    public ShelfResponse createShelf(ShelfRequest request) {
        Tenant tenant = getCurrentTenant();
        Rack rack = rackRepository.findByIdAndZoneWarehouseEnterpriseId(request.getRackId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Rack not found with id: " + request.getRackId()));

        String barcodeTag = request.getBarcodeTag();
        if (barcodeTag == null || barcodeTag.isBlank()) {
            barcodeTag = generateAutoBarcode(request.getShelfCode());
        }

        Shelf shelf = Shelf.builder()
                .rack(rack)
                .shelfCode(request.getShelfCode())
                .barcodeTag(barcodeTag)
                .levelNo(request.getLevelNo())
                .pickSequence(request.getPickSequence())
                .maxWeight(request.getMaxWeight())
                .maxVolume(request.getMaxVolume())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .description(request.getDescription())
                .build();

        generateAndSetBarcodeImage(shelf, tenant.getTenantId());

        return toResponse(shelfRepository.save(shelf));
    }

    public ShelfResponse updateShelf(Long id, ShelfRequest request) {
        Tenant tenant = getCurrentTenant();
        Shelf shelf = shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Shelf not found with id: " + id));

        Rack rack = rackRepository.findByIdAndZoneWarehouseEnterpriseId(request.getRackId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Rack not found with id: " + request.getRackId()));

        boolean barcodeChanged = false;
        String newBarcodeTag = request.getBarcodeTag();
        if (newBarcodeTag != null && !newBarcodeTag.isBlank() && !newBarcodeTag.equals(shelf.getBarcodeTag())) {
            shelf.setBarcodeTag(newBarcodeTag);
            barcodeChanged = true;
        } else if (newBarcodeTag == null || newBarcodeTag.isBlank()) {
            if (shelf.getBarcodeTag() == null || shelf.getBarcodeTag().isBlank()) {
                shelf.setBarcodeTag(generateAutoBarcode(request.getShelfCode()));
                barcodeChanged = true;
            }
        }

        shelf.setRack(rack);
        shelf.setShelfCode(request.getShelfCode());
        shelf.setLevelNo(request.getLevelNo());
        shelf.setPickSequence(request.getPickSequence());
        shelf.setMaxWeight(request.getMaxWeight());
        shelf.setMaxVolume(request.getMaxVolume());
        shelf.setIsActive(request.getIsActive());
        shelf.setDescription(request.getDescription());

        if (barcodeChanged || shelf.getBarcodeImageUrl() == null) {
            generateAndSetBarcodeImage(shelf, tenant.getTenantId());
        }

        return toResponse(shelfRepository.save(shelf));
    }

    private String generateAutoBarcode(String shelfCode) {
        return "SHF-" + shelfCode + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void generateAndSetBarcodeImage(Shelf shelf, String tenantId) {
        try {
            byte[] barcodeImage = barcodeService.generateBarcodeImage(shelf.getBarcodeTag());
            String imageUrl = storageService.storeShelfFile(barcodeImage, shelf.getShelfCode(), tenantId);
            shelf.setBarcodeImageUrl(imageUrl);
        } catch (IOException e) {
            log.error("Failed to generate/store barcode image for shelf: {}", shelf.getShelfCode(), e);
        }
    }

    public void deleteShelf(Long id) {
        Tenant tenant = getCurrentTenant();
        Shelf shelf = shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Shelf not found with id: " + id));
        shelfRepository.delete(shelf);
    }

    private ShelfResponse toResponse(Shelf shelf) {
        return ShelfResponse.builder()
                .id(shelf.getId())
                .rackId(shelf.getRack().getId())
                .rackCode(shelf.getRack().getRackCode())
                .shelfCode(shelf.getShelfCode())
                .barcodeTag(shelf.getBarcodeTag())
                .barcodeImageUrl(shelf.getBarcodeImageUrl())
                .levelNo(shelf.getLevelNo())
                .pickSequence(shelf.getPickSequence())
                .maxWeight(shelf.getMaxWeight())
                .maxVolume(shelf.getMaxVolume())
                .isActive(shelf.getIsActive())
                .description(shelf.getDescription())
                .build();
    }
}
