package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingItemRequest {
    private Integer lineNumber;
    private Long itemId;
    private String itemName;
    private String content;
    private BigDecimal quantity;
    private String uom;
}
