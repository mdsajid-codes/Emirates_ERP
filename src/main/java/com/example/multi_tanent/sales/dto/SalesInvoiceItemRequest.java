package com.example.multi_tanent.sales.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SalesInvoiceItemRequest {
    private Long crmProductId;
    private String itemCode;
    private String itemName;

    private Long categoryId;
    private Long subcategoryId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private Long finishedGoodId;

    private String description;

    // New fields
    private BigDecimal quantityGross;
    private BigDecimal quantityNet;
    private BigDecimal sendQuantity;
    private BigDecimal invoiceQuantity;
    private String packingType;

    private BigDecimal rate;
    private BigDecimal amount;

    // Tax
    private BigDecimal taxValue;
    private boolean isTaxExempt;
    private BigDecimal taxPercentage;
}
