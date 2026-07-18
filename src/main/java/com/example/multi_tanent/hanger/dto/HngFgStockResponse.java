package com.example.multi_tanent.hanger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngFgStockResponse {
    private Long finishedGoodId;
    private String itemCode;
    private String itemName;
    private String hangerType;
    private BigDecimal stockQuantity;
    private BigDecimal unitWeightGrams;
    private BigDecimal salesPrice;
}
