package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProSemifinished;

import com.example.multi_tanent.production.enums.ItemType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProSemiFinishedResponse {
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
    private boolean isRoll;
    private boolean isScrapItem;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;
    private String description;
    private Long issueUnitId;
    private String issueUnitName;
    private Long purchaseUnitId;
    private String purchaseUnitName;
    private BigDecimal unitRelation;
    private BigDecimal wastagePercentage;
    private BigDecimal reorderLimit;
    private BigDecimal stockQuantity;
    private Long taxId;
    private String taxCode;
    private BigDecimal taxRate;
    private boolean isTaxInclusive;
    private BigDecimal purchasePrice;
    private BigDecimal salesPrice;
    private String picturePath;
    private String barcode;
    private String barcodeImgUrl;

    public static ProSemiFinishedResponse fromEntity(ProSemifinished entity) {
        return ProSemiFinishedResponse.builder()
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
                .isRoll(entity.isRoll())
                .isScrapItem(entity.isScrapItem())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .subCategoryId(entity.getSubCategory() != null ? entity.getSubCategory().getId() : null)
                .subCategoryName(entity.getSubCategory() != null ? entity.getSubCategory().getName() : null)
                .description(entity.getDescription())
                .issueUnitId(entity.getIssueUnit() != null ? entity.getIssueUnit().getId() : null)
                .issueUnitName(entity.getIssueUnit() != null ? entity.getIssueUnit().getName() : null)
                .purchaseUnitId(entity.getPurchaseUnit() != null ? entity.getPurchaseUnit().getId() : null)
                .purchaseUnitName(entity.getPurchaseUnit() != null ? entity.getPurchaseUnit().getName() : null)
                .unitRelation(entity.getUnitRelation())
                .wastagePercentage(entity.getWastagePercentage())
                .reorderLimit(entity.getReorderLimit())
                .stockQuantity(entity.getStockQuantity())
                .taxId(entity.getTax() != null ? entity.getTax().getId() : null)
                .taxCode(entity.getTax() != null ? entity.getTax().getCode() : null)
                .taxRate(entity.getTax() != null ? entity.getTax().getRate() : null)
                .isTaxInclusive(entity.isTaxInclusive())
                .purchasePrice(entity.getPurchasePrice())
                .salesPrice(entity.getSalesPrice())
                .picturePath(entity.getPicturePath())
                .barcode(entity.getBarcode())
                .barcodeImgUrl(entity.getBarcodeImgUrl())
                .build();
    }
}
