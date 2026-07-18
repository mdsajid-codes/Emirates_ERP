package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.enums.ItemType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProRawMaterialsRequest {
    @NotBlank(message = "Item code is required.")
    private String itemCode;

    @NotBlank(message = "Name is required.")
    private String name;

    private Long locationId;
    private Long inventoryTypeId;
    private ItemType itemType;
    private boolean forPurchase;
    private boolean forSales;
    private Long categoryId;
    private Long subCategoryId;
    private String barcode;
    private String description;
    private Long issueUnitId;
    private Long purchaseUnitId;
    private BigDecimal unitRelation;
    private BigDecimal reorderLimit;
    private Long taxId;
    private BigDecimal purchasePrice;
    private BigDecimal salesPrice;
    private BigDecimal stockQuantity;
    private boolean discontinued;
    private String picturePath;
}