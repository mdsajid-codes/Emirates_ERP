package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class StockMovementRequest {
    @NotNull(message = "Store ID is required.")
    private Long storeId;

    // Not required for bulk upload, where SKU is used initially
    private Long productVariantId;

    @NotNull(message = "Change quantity is required.")
    private Long changeQuantity;

    @NotBlank(message = "Reason is required.")
    private String reason; // e.g., "adjustment", "initial_stock", "damage"

    private String batchCode;
    private OffsetDateTime expireDate;

    // Transient field for bulk upload linking
    private String productVariantSkuForBulk;
}