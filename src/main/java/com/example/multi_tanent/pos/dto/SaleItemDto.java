package com.example.multi_tanent.pos.dto;

import lombok.Data;

@Data
public class SaleItemDto {
    private Long id;
    private Long productVariantId;
    private String productName;
    private Long quantity;
    private Long unitPriceCents;
    private Long lineTotalCents;
    private Long taxCents;
    private Long discountCents;
}