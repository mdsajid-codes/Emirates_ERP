package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProSubCategoryRequest {
    @NotNull(message = "Parent Category ID is required.")
    private Long categoryId;

    @NotBlank(message = "Sub-category name is required.")
    private String name;

    @NotBlank(message = "Sub-category code is required.")
    private String code;

    private Long locationId; // Optional
}