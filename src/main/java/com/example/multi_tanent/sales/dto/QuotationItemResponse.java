package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuotationItemResponse {
    private Long id;
    private Long crmProductId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private Long finishedGoodId;
    private String itemCode;
    private String itemName;
    private Long categoryId;
    private String categoryName;
    private Long subcategoryId;
    private String subcategoryName;
    private Integer quantity;
    private BigDecimal rate;
    private BigDecimal amount;
    private BigDecimal taxValue;
    private BigDecimal taxPercentage;
    private boolean isTaxExempt;
}
