package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRequestForQuotationItemResponse {
    private Long id;
    private Long tenderingItemId;
    private Long itemId;
    private String itemName;
    private BigDecimal quantity;
    private String uom;
}
