package com.example.multi_tanent.pos.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class StockMovementDto {
    private Long id;
    private Long storeId;
    private String storeName;
    private Long productVariantId;
    private String productVariantSku;
    private String productName;
    private Long changeQuantity;
    private String reason;
    private Long relatedSaleId;
    private String relatedPurchasePoNumber;
    private String batchCode;
    private OffsetDateTime expireDate;
    private OffsetDateTime createdAt;
}