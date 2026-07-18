package com.example.multi_tanent.pos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceItemDto {
    private String productName;
    private String variantInfo;
    private Long quantity;
    private Long unitPriceCents;
    private Long lineTotalCents;
    private Long taxCents;
}