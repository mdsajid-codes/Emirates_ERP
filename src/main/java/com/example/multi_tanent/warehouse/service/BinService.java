package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.BinRequest;
import com.example.multi_tanent.warehouse.dto.BinResponse;
import com.example.multi_tanent.warehouse.dto.PaginatedResponse;
import com.example.multi_tanent.warehouse.entity.Bin;
import com.example.multi_tanent.warehouse.entity.Shelf;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.BinType;
import com.example.multi_tanent.warehouse.repository.BinRepository;
import com.example.multi_tanent.warehouse.repository.ShelfRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class BinService {

    private final BinRepository binRepository;
    private final ShelfRepository shelfRepository;
    private final WareHouseRepository warehouseRepository;
    private final TenantRepository tenantRepository;
    private final WareBarcodeService barcodeService;
    private final WareStorageService storageService;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public List<BinResponse> listAll() {
        Tenant tenant = getCurrentTenant();
        return binRepository.findByWarehouseEnterpriseId(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<BinResponse> listPaginated(Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        Page<Bin> binPage = binRepository.findByWarehouseEnterpriseId(tenant.getId(), pageable);

        return PaginatedResponse.<BinResponse>builder()
                .content(binPage.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .pageNo(binPage.getNumber())
                .pageSize(binPage.getSize())
                .totalElements(binPage.getTotalElements())
                .totalPages(binPage.getTotalPages())
                .last(binPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public BinResponse getById(Long id) {
        Tenant tenant = getCurrentTenant();
        return binRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Bin not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<BinResponse> fetchByActive(Boolean isActive) {
        Tenant tenant = getCurrentTenant();
        return binRepository.findByIsActiveAndWarehouseEnterpriseId(isActive, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BinResponse> fetchByBinType(BinType binType) {
        Tenant tenant = getCurrentTenant();
        return binRepository.findByBinTypeAndWarehouseEnterpriseId(binType, tenant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BinResponse fetchByBarcodeTag(String barcodeTag) {
        Tenant tenant = getCurrentTenant();
        return binRepository.findByBarcodeTagAndWarehouseEnterpriseId(barcodeTag, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Bin not found with barcodeTag: " + barcodeTag));
    }

    public BinResponse create(BinRequest request) {
        Tenant tenant = getCurrentTenant();

        if (binRepository.existsByBinCodeAndWarehouseIdAndWarehouseEnterpriseId(request.getBinCode(),
                request.getWarehouseId(), tenant.getId())) {
            throw new IllegalArgumentException("Bin code already exists in this warehouse: " + request.getBinCode());
        }

        Shelf shelf = shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(request.getShelfId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Shelf not found with id: " + request.getShelfId()));

        WareHouse warehouse = warehouseRepository.findByIdAndEnterpriseId(request.getWarehouseId(), tenant.getId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        String barcodeTag = request.getBarcodeTag();
        if (barcodeTag == null || barcodeTag.isBlank()) {
            barcodeTag = generateAutoBarcode(request.getBinCode());
        }

        Bin bin = Bin.builder()
                .shelf(shelf)
                .warehouse(warehouse)
                .binCode(request.getBinCode())
                .barcodeTag(barcodeTag)
                .binType(request.getBinType())
                .capacityQty(request.getCapacityQty())
                .capacityWeight(request.getCapacityWeight())
                .capacityVolume(request.getCapacityVolume())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .blocked(request.getBlocked() != null ? request.getBlocked() : false)
                .blockReason(request.getBlockReason())
                .pickSequence(request.getPickSequence())
                .hazardousAllowed(request.getHazardousAllowed() != null ? request.getHazardousAllowed() : false)
                .minTemp(request.getMinTemp())
                .maxTemp(request.getMaxTemp())
                .description(request.getDescription())
                .build();

        generateAndSetBarcodeImage(bin, tenant.getTenantId());

        return toResponse(binRepository.save(bin));
    }

    public BinResponse update(Long id, BinRequest request) {
        Tenant tenant = getCurrentTenant();
        Bin bin = binRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Bin not found with id: " + id));

        Shelf shelf = shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(request.getShelfId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Shelf not found with id: " + request.getShelfId()));

        WareHouse warehouse = warehouseRepository.findByIdAndEnterpriseId(request.getWarehouseId(), tenant.getId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        boolean barcodeChanged = false;
        String newBarcodeTag = request.getBarcodeTag();
        if (newBarcodeTag != null && !newBarcodeTag.isBlank() && !newBarcodeTag.equals(bin.getBarcodeTag())) {
            bin.setBarcodeTag(newBarcodeTag);
            barcodeChanged = true;
        }

        bin.setShelf(shelf);
        bin.setWarehouse(warehouse);
        bin.setBinCode(request.getBinCode());
        bin.setBinType(request.getBinType());
        bin.setCapacityQty(request.getCapacityQty());
        bin.setCapacityWeight(request.getCapacityWeight());
        bin.setCapacityVolume(request.getCapacityVolume());
        bin.setIsActive(request.getIsActive());
        bin.setBlocked(request.getBlocked());
        bin.setBlockReason(request.getBlockReason());
        bin.setPickSequence(request.getPickSequence());
        bin.setHazardousAllowed(request.getHazardousAllowed());
        bin.setMinTemp(request.getMinTemp());
        bin.setMaxTemp(request.getMaxTemp());
        bin.setDescription(request.getDescription());

        if (barcodeChanged || bin.getBarcodeImageUrl() == null) {
            generateAndSetBarcodeImage(bin, tenant.getTenantId());
        }

        return toResponse(binRepository.save(bin));
    }

    private String generateAutoBarcode(String binCode) {
        return binCode + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void generateAndSetBarcodeImage(Bin bin, String tenantId) {
        try {
            byte[] barcodeImage = barcodeService.generateBarcodeImage(bin.getBarcodeTag());
            String imageUrl = storageService.storeBinFile(barcodeImage, bin.getBinCode(), tenantId);
            bin.setBarcodeImageUrl(imageUrl);
        } catch (IOException e) {
            log.error("Failed to generate/store barcode image for bin: {}", bin.getBinCode(), e);
        }
    }

    public void delete(Long id) {
        Tenant tenant = getCurrentTenant();
        Bin bin = binRepository.findByIdAndWarehouseEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Bin not found with id: " + id));
        binRepository.delete(bin);
    }

    private BinResponse toResponse(Bin bin) {
        return BinResponse.builder()
                .id(bin.getId())
                .shelfId(bin.getShelf().getId())
                .shelfCode(bin.getShelf().getShelfCode())
                .warehouseId(bin.getWarehouse().getId())
                .warehouseName(bin.getWarehouse().getName())
                .binCode(bin.getBinCode())
                .barcodeTag(bin.getBarcodeTag())
                .barcodeImageUrl(bin.getBarcodeImageUrl())
                .binType(bin.getBinType())
                .capacityQty(bin.getCapacityQty())
                .capacityWeight(bin.getCapacityWeight())
                .capacityVolume(bin.getCapacityVolume())
                .isActive(bin.getIsActive())
                .blocked(bin.getBlocked())
                .blockReason(bin.getBlockReason())
                .pickSequence(bin.getPickSequence())
                .hazardousAllowed(bin.getHazardousAllowed())
                .minTemp(bin.getMinTemp())
                .maxTemp(bin.getMaxTemp())
                .description(bin.getDescription())
                .build();
    }
}
