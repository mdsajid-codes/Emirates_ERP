package com.example.multi_tanent.purchases.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseOrderItemResponse {
    private Long id;
    private Integer lineNumber;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;

    private Long itemId;
    private String itemName;
    private String description;

    private BigDecimal quantity;
    private Long unitId;
    private String unitName;
    private BigDecimal rate;
    private BigDecimal amount;

    private Long taxId;
    private String taxName;
    private Boolean taxExempt;
    private BigDecimal taxPercent;
    private BigDecimal lineDiscount;
    private BigDecimal discountPercent;
}
