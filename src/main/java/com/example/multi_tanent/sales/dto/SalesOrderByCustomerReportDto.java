package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesOrderByCustomerReportDto {
    private String customerName;
    private Long salesCount;
    private BigDecimal salesAmount;
}
