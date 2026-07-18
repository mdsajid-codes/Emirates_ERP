package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.enums.CalculationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BenefitTypeRequest {
    @NotBlank(message = "Benefit code is required.")
    @Size(max = 50, message = "Code cannot be longer than 50 characters.")
    private String code;

    @NotBlank(message = "Benefit name is required.")
    private String name;

    private String description;

    @NotNull(message = "Calculation type is required.")
    private CalculationType calculationType;

    private BigDecimal valueForAccrual;

    private Boolean isActive = true;
}