package com.example.multi_tanent.sales.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SalesInvoiceItemResponse {
    private Long id;
    private Long crmProductId;
    private String itemCode;
    private String itemName;

    private Long categoryId;
    private String categoryName;
    private Long subcategoryId;
    private String subcategoryName;

    private Long rawMaterialId;
    private String rawMaterialName;
    private Long semiFinishedId;
    private String semiFinishedName;
    private Long finishedGoodId;
    private String finishedGoodName;

    private String description;

    private BigDecimal quantityGross;
    private BigDecimal quantityNet;
    private BigDecimal sendQuantity;
    private BigDecimal invoiceQuantity;
    private String packingType;

    private BigDecimal rate;
    private BigDecimal amount;

    private BigDecimal taxValue;
    private boolean isTaxExempt;
    private BigDecimal taxPercentage;
}
