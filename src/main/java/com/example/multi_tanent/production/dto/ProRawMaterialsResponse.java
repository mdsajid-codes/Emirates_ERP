package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProRawMaterials;

import com.example.multi_tanent.production.enums.ItemType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProRawMaterialsResponse {
    private Long id;
    private String itemCode;
    private String name;
    private Long locationId;
    private String locationName;
    private Long inventoryTypeId;
    private String inventoryTypeName;
    private ItemType itemType;
    private boolean forPurchase;
    private boolean forSales;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;
    private String barcode;
    private String barcodeImgUrl;
    private String description;
    private Long issueUnitId;
    private String issueUnitName;
    private Long purchaseUnitId;
    private String purchaseUnitName;
    private BigDecimal unitRelation;
    private BigDecimal reorderLimit;
    private Long taxId;
    private String taxCode;
    private BigDecimal taxRate;
    private BigDecimal purchasePrice;
    private BigDecimal salesPrice;
    private BigDecimal stockQuantity;
    private boolean discontinued;
    private String picturePath;

    public static ProRawMaterialsResponse fromEntity(ProRawMaterials entity) {
        return ProRawMaterialsResponse.builder()
                .id(entity.getId())
                .itemCode(entity.getItemCode())
                .name(entity.getName())
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .inventoryTypeId(entity.getInventoryType() != null ? entity.getInventoryType().getId() : null)
                .inventoryTypeName(entity.getInventoryType() != null ? entity.getInventoryType().getName() : null)
                .itemType(entity.getItemType())
                .forPurchase(entity.isForPurchase())
                .forSales(entity.isForSales())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .subCategoryId(entity.getSubCategory() != null ? entity.getSubCategory().getId() : null)
                .subCategoryName(entity.getSubCategory() != null ? entity.getSubCategory().getName() : null)
                .barcode(entity.getBarcode())
                .barcodeImgUrl(entity.getBarcodeImgUrl())
                .description(entity.getDescription())
                .issueUnitId(entity.getIssueUnit() != null ? entity.getIssueUnit().getId() : null)
                .issueUnitName(entity.getIssueUnit() != null ? entity.getIssueUnit().getName() : null)
                .purchaseUnitId(entity.getPurchaseUnit() != null ? entity.getPurchaseUnit().getId() : null)
                .purchaseUnitName(entity.getPurchaseUnit() != null ? entity.getPurchaseUnit().getName() : null)
                .unitRelation(entity.getUnitRelation())
                .reorderLimit(entity.getReorderLimit())
                .taxId(entity.getTax() != null ? entity.getTax().getId() : null)
                .taxCode(entity.getTax() != null ? entity.getTax().getCode() : null)
                .taxRate(entity.getTax() != null ? entity.getTax().getRate() : null)
                .purchasePrice(entity.getPurchasePrice())
                .salesPrice(entity.getSalesPrice())
                .stockQuantity(entity.getStockQuantity())
                .discontinued(entity.isDiscontinued())
                .picturePath(entity.getPicturePath())
                .build();
    }
}