package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProductRequest {
    private String sku;
    private String name;
    private String barcode;
    private String barcodeImageUrl;
    private String imageUrl;
    private String description;
    private Long categoryId;
    private Long subCategoryId;
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
    private Long taxId;
    private Long locationId;

    // --- Product Source Links ---
    private String sourceType;
    private Long crmProductId;
    private Long rawMaterialId;
    private Long semifinishedId;
    private Long finishedGoodId;
    
    private Long warehouseId;

    // --- Stock Alert Fields ---
    private BigDecimal minStockLevel;
    private BigDecimal maxStockLevel;
    private BigDecimal reorderPoint;
    private BigDecimal stockQuantity;
}
