package com.example.multi_tanent.sales.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProformaInvoiceItemRequest {
    private Long crmProductId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private Long finishedGoodId;

    private String itemCode;
    private String itemName;
    private String description;
    private Long categoryId;
    private Long subcategoryId;
    private Integer quantity;
    private BigDecimal rate; // Corresponds to rentalValue in RSO

    // Tax
    private BigDecimal taxValue;
    private boolean isTaxExempt;
    private BigDecimal taxPercentage;
}
