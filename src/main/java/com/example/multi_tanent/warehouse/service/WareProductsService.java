package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.PaginatedResponse;
import com.example.multi_tanent.warehouse.dto.WareProductRequest;
import com.example.multi_tanent.warehouse.dto.WareProductResponse;
import com.example.multi_tanent.warehouse.entity.*;
import com.example.multi_tanent.warehouse.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import com.example.multi_tanent.production.repository.ProFinishedGoodRepository;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.production.repository.ProSemiFinishedRepository;
import com.example.multi_tanent.spersusers.repository.CrmSalesProductRepository;
import com.example.multi_tanent.warehouse.enums.ProductSourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class WareProductsService {

    private final WareProductsRepository productRepository;
    private final WareCategoryRepository categoryRepository;
    private final WareSubCategoryRepository subCategoryRepository;
    private final UoMRepository uomRepository;
    private final WareTaxRepository taxRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final WareHouseRepository warehouseRepository;
    private final CrmSalesProductRepository crmSalesProductRepository;
    private final ProRawMaterialsRepository proRawMaterialsRepository;
    private final ProSemiFinishedRepository proSemiFinishedRepository;
    private final ProFinishedGoodRepository proFinishedGoodRepository;
    private final WareBarcodeService barcodeService;
    private final WareStorageService storageService;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional(readOnly = true)
    public WareProductResponse getByBarcode(String barcode) {
        Tenant t = getCurrentTenant();
        return productRepository.findByBarcodeAndEnterpriseId(barcode, t.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with barcode: " + barcode));
    }

    @Transactional(readOnly = true)
    public List<WareProductResponse> list() {
        Tenant t = getCurrentTenant();
        return productRepository.findByEnterpriseId(t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<WareProductResponse> listPaginated(Pageable pageable) {
        Tenant t = getCurrentTenant();
        Page<WareProducts> productsPage = productRepository.findByEnterpriseId(t.getId(), pageable);

        List<WareProductResponse> content = productsPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<WareProductResponse>builder()
                .content(content)
                .pageNo(productsPage.getNumber())
                .pageSize(productsPage.getSize())
                .totalElements(productsPage.getTotalElements())
                .totalPages(productsPage.getTotalPages())
                .last(productsPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public WareProductResponse getById(Long id) {
        Tenant t = getCurrentTenant();
        return productRepository.findByIdAndEnterpriseId(id, t.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }

    // --- Stock Alerts ---
    
    @Transactional(readOnly = true)
    public List<WareProductResponse> getLowStockProducts() {
        Tenant t = getCurrentTenant();
        return productRepository.findLowStockProducts(t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WareProductResponse> getOverstockProducts() {
        Tenant t = getCurrentTenant();
        return productRepository.findOverstockProducts(t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
    
    // --------------------

    public WareProductResponse create(WareProductRequest req) {
        Tenant t = getCurrentTenant();

        if (productRepository.existsBySkuAndEnterpriseId(req.getSku(), t.getId())) {
            throw new IllegalArgumentException("SKU already exists");
        }

        WareProducts p = WareProducts.builder()
                .enterprise(t)
                .sku(req.getSku())
                .name(req.getName())
                .barcode(req.getBarcode())
                .barcodeImageUrl(req.getBarcodeImageUrl())
                .imageUrl(req.getImageUrl())
                .description(req.getDescription())
                .brand(req.getBrand())
                .model(req.getModel())
                .purchasePrice(req.getPurchasePrice())
                .salePrice(req.getSalePrice())
                .taxInclusive(req.getTaxInclusive())
                .batchTracking(req.getBatchTracking())
                .serialTracking(req.getSerialTracking())
                .expiryTracking(req.getExpiryTracking())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .sourceType(req.getSourceType() != null ? ProductSourceType.valueOf(req.getSourceType()) : ProductSourceType.STANDALONE)
                .minStockLevel(req.getMinStockLevel())
                .maxStockLevel(req.getMaxStockLevel())
                .reorderPoint(req.getReorderPoint())
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : java.math.BigDecimal.ZERO)
                .build();

        mapRelations(p, req, t.getId());
        return toResponse(productRepository.save(p));
    }

    public WareProductResponse update(Long id, WareProductRequest req) {
        Tenant t = getCurrentTenant();
        WareProducts p = productRepository.findByIdAndEnterpriseId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (!p.getSku().equals(req.getSku()) && productRepository.existsBySkuAndEnterpriseId(req.getSku(), t.getId())) {
            throw new IllegalArgumentException("SKU already exists");
        }

        p.setSku(req.getSku());
        p.setName(req.getName());
        p.setBarcode(req.getBarcode());
        p.setBarcodeImageUrl(req.getBarcodeImageUrl());
        p.setImageUrl(req.getImageUrl());
        p.setDescription(req.getDescription());
        p.setBrand(req.getBrand());
        p.setModel(req.getModel());
        p.setPurchasePrice(req.getPurchasePrice());
        p.setSalePrice(req.getSalePrice());
        p.setTaxInclusive(req.getTaxInclusive());
        p.setBatchTracking(req.getBatchTracking());
        p.setSerialTracking(req.getSerialTracking());
        p.setExpiryTracking(req.getExpiryTracking());
        p.setIsActive(req.getIsActive() != null ? req.getIsActive() : p.getIsActive());
        p.setSourceType(req.getSourceType() != null ? ProductSourceType.valueOf(req.getSourceType()) : ProductSourceType.STANDALONE);
        p.setMinStockLevel(req.getMinStockLevel());
        p.setMaxStockLevel(req.getMaxStockLevel());
        p.setReorderPoint(req.getReorderPoint());
        if (req.getStockQuantity() != null) {
            p.setStockQuantity(req.getStockQuantity());
        }

        mapRelations(p, req, t.getId());
        return toResponse(productRepository.save(p));
    }

    public void delete(Long id) {
        Tenant t = getCurrentTenant();
        WareProducts p = productRepository.findByIdAndEnterpriseId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        productRepository.delete(p);
    }

    public void importProducts(List<WareProductRequest> requests) {
        for (WareProductRequest req : requests) {
            try {
                create(req);
            } catch (Exception e) {
                // Log error or handle as needed, skipping for bulk simplicity
            }
        }
    }

    private void generateAndSaveBarcode(WareProducts p, String tenantId) throws Exception {
        byte[] barcodeImage = barcodeService.generateBarcodeImage(p.getSku());
        String path = storageService.storeProductFile(barcodeImage, p.getSku() + "_barcode.png", tenantId);
        p.setBarcodeImageUrl(path);
        p.setBarcode(p.getSku()); // Default barcode to SKU if not provided
    }

    private void mapRelations(WareProducts p, WareProductRequest req, Long tenantId) {
        if (req.getCategoryId() != null) {
            p.setCategory(categoryRepository.findById(req.getCategoryId()).orElse(null));
        }
        if (req.getSubCategoryId() != null) {
            p.setSubCategory(subCategoryRepository.findById(req.getSubCategoryId()).orElse(null));
        }
        if (req.getUomId() != null) {
            p.setUom(uomRepository.findById(req.getUomId()).orElse(null));
        }
        if (req.getTaxId() != null) {
            p.setTax(taxRepository.findById(req.getTaxId()).orElse(null));
        }
        if (req.getLocationId() != null) {
            p.setLocation(locationRepository.findById(req.getLocationId()).orElse(null));
        }
        if (req.getWarehouseId() != null) {
            p.setWarehouse(warehouseRepository.findById(req.getWarehouseId()).orElse(null));
        }
        
        // --- Map Source Relations ---
        if (req.getCrmProductId() != null) {
            p.setCrmProduct(crmSalesProductRepository.findById(req.getCrmProductId()).orElse(null));
        }
        if (req.getRawMaterialId() != null) {
            p.setRawMaterial(proRawMaterialsRepository.findById(req.getRawMaterialId()).orElse(null));
        }
        if (req.getSemifinishedId() != null) {
            p.setSemifinished(proSemiFinishedRepository.findById(req.getSemifinishedId()).orElse(null));
        }
        if (req.getFinishedGoodId() != null) {
            p.setFinishedGood(proFinishedGoodRepository.findById(req.getFinishedGoodId()).orElse(null));
        }
    }

    private WareProductResponse toResponse(WareProducts p) {
        return WareProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .barcode(p.getBarcode())
                .barcodeImageUrl(p.getBarcodeImageUrl())
                .imageUrl(p.getImageUrl())
                .description(p.getDescription())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .subCategoryId(p.getSubCategory() != null ? p.getSubCategory().getId() : null)
                .subCategoryName(p.getSubCategory() != null ? p.getSubCategory().getName() : null)
                .brand(p.getBrand())
                .model(p.getModel())
                .purchasePrice(p.getPurchasePrice())
                .salePrice(p.getSalePrice())
                .taxInclusive(p.getTaxInclusive())
                .batchTracking(p.getBatchTracking())
                .serialTracking(p.getSerialTracking())
                .expiryTracking(p.getExpiryTracking())
                .isActive(p.getIsActive())
                .uomId(p.getUom() != null ? p.getUom().getId() : null)
                .uomName(p.getUom() != null ? p.getUom().getName() : null)
                .taxId(p.getTax() != null ? p.getTax().getId() : null)
                .taxName(p.getTax() != null ? p.getTax().getName() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .sourceType(p.getSourceType() != null ? p.getSourceType().name() : null)
                .crmProductId(p.getCrmProduct() != null ? p.getCrmProduct().getId() : null)
                .crmProductName(p.getCrmProduct() != null ? p.getCrmProduct().getName() : null)
                .rawMaterialId(p.getRawMaterial() != null ? p.getRawMaterial().getId() : null)
                .rawMaterialName(p.getRawMaterial() != null ? p.getRawMaterial().getName() : null)
                .semifinishedId(p.getSemifinished() != null ? p.getSemifinished().getId() : null)
                .semifinishedName(p.getSemifinished() != null ? p.getSemifinished().getName() : null)
                .finishedGoodId(p.getFinishedGood() != null ? p.getFinishedGood().getId() : null)
                .finishedGoodName(p.getFinishedGood() != null ? p.getFinishedGood().getName() : null)
                .warehouseId(p.getWarehouse() != null ? p.getWarehouse().getId() : null)
                .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                .minStockLevel(p.getMinStockLevel())
                .maxStockLevel(p.getMaxStockLevel())
                .reorderPoint(p.getReorderPoint())
                .stockQuantity(p.getStockQuantity())
                .build();
    }
}
