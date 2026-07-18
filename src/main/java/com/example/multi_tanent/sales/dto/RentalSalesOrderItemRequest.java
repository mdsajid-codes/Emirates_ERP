package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RentalSalesOrderItemRequest {
    private Long id;
    private Long crmProductId;
    private String itemCode;
    private String itemName;
    private String description;
    private Long categoryId;
    private Long subcategoryId;
    private Integer quantity;
    private BigDecimal rentalValue;
    private BigDecimal taxValue;
    private BigDecimal taxPercentage;
    private boolean isTaxExempt;
}
