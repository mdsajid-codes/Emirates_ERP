package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProCategoryRequest {
    @NotBlank(message = "Category name is required.")
    private String name;

    @NotBlank(message = "Category code is required.")
    private String code;

    private Long locationId; // Optional
}