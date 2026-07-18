package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaxRateRequest {
    @NotBlank(message = "Tax rate name is required")
    private String name;

    @NotNull(message = "Percent is required")
    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "100.0", inclusive = true)
    private BigDecimal percent;

    private boolean compound = false;
}