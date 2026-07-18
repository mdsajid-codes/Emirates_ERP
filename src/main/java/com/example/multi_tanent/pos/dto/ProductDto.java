package com.example.multi_tanent.pos.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductDto {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private boolean isActive;
    private Long categoryId;
    private String categoryName;
    private List<ProductVariantDto> variants;
}