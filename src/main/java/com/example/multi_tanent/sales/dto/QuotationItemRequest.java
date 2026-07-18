package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuotationItemRequest {
    private Long crmProductId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private Long finishedGoodId;
    private String itemCode;
    private String itemName;
    private Long categoryId;
    private Long subcategoryId;
    private Integer quantity;
    private BigDecimal rate;
    private BigDecimal taxValue;
    private BigDecimal taxPercentage;
    private boolean isTaxExempt;
}
