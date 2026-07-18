package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseInvoiceItemResponse {
    private Long id;
    private Integer lineNumber;

    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;

    private Long itemId;
    private String itemName;
    private String description;

    private BigDecimal quantityGross;
    private BigDecimal quantityNet;
    private Long unitId;
    private String unitName;

    private BigDecimal rate;
    private BigDecimal amount;

    private Long taxId;
    private String taxName;
    private BigDecimal taxPercent;

    private BigDecimal lineDiscount;
    private BigDecimal discountPercent;
}
