package com.example.multi_tanent.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PlanRequest {
    @NotBlank(message = "Plan code is required")
    private String code;

    @NotBlank(message = "Plan name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    private Long priceCents;

    private String currency = "AED";
    private String billingInterval = "MONTH";
    private Integer trialDays = 0;
    private boolean active = true;

    @Valid
    private List<PlanFeatureRequest> features;
}