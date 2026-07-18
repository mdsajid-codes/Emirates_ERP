package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurRequisitionItemResponse {
    private Long id;
    private Integer lineNumber;
    private Long itemId;
    private String itemName;
    private String description;
    private BigDecimal quantity;
    private Long unitId;
    private String unitName;
    private BigDecimal rate;
    private BigDecimal amount;
}
