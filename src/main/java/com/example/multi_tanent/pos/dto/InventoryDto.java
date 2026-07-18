package com.example.multi_tanent.pos.dto;

import lombok.Data;

@Data
public class InventoryDto {
    private Long inventoryId;
    private Long storeId;
    private String storeName;
    private Long productVariantId;
    private String productName;
    private String productVariantSku;
    private Long quantity;
}