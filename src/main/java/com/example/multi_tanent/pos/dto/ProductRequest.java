package com.example.multi_tanent.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    private String sku;
    private String description;
    private boolean isActive = true;

    private Long categoryId;

    @Valid
    private List<ProductVariantRequest> variants;
}