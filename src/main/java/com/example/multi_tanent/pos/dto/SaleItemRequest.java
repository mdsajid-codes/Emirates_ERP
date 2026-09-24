package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaleItemRequest {
    private Long productId;
    private Long productVariantId;

    @NotNull(message = "Quantity is required.")
    @Min(value = 1, message = "Quantity must be at least 1.")
    private Long quantity;

    public Long getProductId() {
        return productId != null ? productId : productVariantId;
    }
}