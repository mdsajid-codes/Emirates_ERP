package com.example.multi_tanent.pos.dto;

import lombok.Data;

@Data
public class PurchaseOrderItemDto {
    private Long id;
    private Long productVariantId;
    private String productVariantSku;
    private String productName;
    private Long quantityOrdered;
    private Long unitCostCents;
}