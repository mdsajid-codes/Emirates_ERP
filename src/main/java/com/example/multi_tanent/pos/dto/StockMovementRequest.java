package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class StockMovementRequest {
    @NotNull(message = "Store ID is required.")
    private Long storeId;

    private Long productId;
    private Long productVariantId;

    public Long getProductId() {
        return productId != null ? productId : productVariantId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
        this.productVariantId = productId;
    }

    public void setProductVariantId(Long productVariantId) {
        this.productVariantId = productVariantId;
        this.productId = productVariantId;
    }

    @NotNull(message = "Change quantity is required.")
    private Long changeQuantity;

    @NotBlank(message = "Reason is required.")
    private String reason; // e.g., "adjustment", "initial_stock", "damage"

    private String batchCode;
    private OffsetDateTime expireDate;

    private String productVariantSkuForBulk;
}