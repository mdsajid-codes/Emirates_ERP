package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProTaxRequest {
    @NotBlank(message = "Tax code is required.")
    private String code;

    @NotNull(message = "Tax rate is required.")
    private BigDecimal rate;

    private String description;
    private Long locationId; // Optional
}