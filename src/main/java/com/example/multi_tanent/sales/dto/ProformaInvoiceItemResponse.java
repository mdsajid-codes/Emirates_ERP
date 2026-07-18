package com.example.multi_tanent.sales.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProformaInvoiceItemResponse {
    private Long id;
    private Long crmProductId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private Long finishedGoodId;

    private String itemCode;
    private String itemName;
    private String description;

    private Long categoryId;
    private String categoryName;

    private Long subcategoryId;
    private String subcategoryName;

    private Integer quantity;
    private BigDecimal rate;
    private BigDecimal amount;

    private BigDecimal taxValue;
    private boolean isTaxExempt;
    private BigDecimal taxPercentage;
}
