package com.example.multi_tanent.spersusers.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TenantSubscriptionRequest {
    @NotNull(message = "Plan ID is required.")
    private Long planId;

    private Long quantity;
}