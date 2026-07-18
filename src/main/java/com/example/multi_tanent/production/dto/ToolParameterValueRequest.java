package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ToolParameterValueRequest {

    @NotBlank(message = "Parameter value cannot be blank.")
    private String value;

    @Min(value = 1, message = "Position must be at least 1.")
    private Integer position;
}