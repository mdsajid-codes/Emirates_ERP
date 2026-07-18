package com.example.multi_tanent.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostingDto {
    private Long productId;
    private String productName;
    private String sku;
    private String strategy; // FIFO, FEFO, LIFO
    private BigDecimal cogs; // Cost of Goods Sold
    private BigDecimal weightedAvgCost;
    private BigDecimal totalInwardValue;
    private BigDecimal totalOutwardValue;
}
