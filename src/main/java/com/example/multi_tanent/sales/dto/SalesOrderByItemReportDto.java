package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesOrderByItemReportDto {
    private String customerName;
    private Integer quantity;
    private BigDecimal amount;
    private BigDecimal averagePrice;
}
