package com.example.multi_tanent.tenant.base.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BaseCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;

    private String code;
}