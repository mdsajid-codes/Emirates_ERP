package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlanFeatureRequest {
    @NotBlank(message = "Feature key is required")
    private String featureKey;

    @NotNull(message = "Feature value is required")
    private Long value;

    private String meta;
}