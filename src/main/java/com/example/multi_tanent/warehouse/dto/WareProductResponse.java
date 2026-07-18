package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String barcode;
    private String barcodeImageUrl;
    private String imageUrl;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;
    private String brand;
    private String model;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private Boolean taxInclusive;
    private Boolean batchTracking;
    private Boolean serialTracking;
    private Boolean expiryTracking;
    private Boolean isActive;
    private Long uomId;
    private String uomName;
    private Long taxId;
    private String taxName;
    private Long locationId;
    private String locationName;

    // --- Product Source Links ---
    private String sourceType;
    private Long crmProductId;
    private String crmProductName;
    private Long rawMaterialId;
    private String rawMaterialName;
    private Long semifinishedId;
    private String semifinishedName;
    private Long finishedGoodId;
    private String finishedGoodName;
    
    private Long warehouseId;
    private String warehouseName;

    // --- Stock Alert Fields ---
    private BigDecimal minStockLevel;
    private BigDecimal maxStockLevel;
    private BigDecimal reorderPoint;
    private BigDecimal stockQuantity;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
