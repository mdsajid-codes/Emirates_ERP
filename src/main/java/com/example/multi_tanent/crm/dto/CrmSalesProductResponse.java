package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmItemType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class CrmSalesProductResponse {
    private Long id;
    private CrmItemType itemType;
    private Boolean isPurchase;
    private Boolean isSales;
    private String itemCode;
    private String name;
    private String description;
    private String imageUrl;
    private String unitOfMeasure;
    private Integer reorderLimit;
    private String vatClassificationCode;
    private BigDecimal purchasePrice;
    private BigDecimal salesPrice;
    private String tax;
    private String barcode;
    private String barcodeUrl;
    private Double taxRate;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
