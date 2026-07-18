package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProUnitRequest {
    @NotBlank(message = "Unit name is required.")
    private String name;

    private String description;
    private Long locationId; // Optional
}