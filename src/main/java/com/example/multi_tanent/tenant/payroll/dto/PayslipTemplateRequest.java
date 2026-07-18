package com.example.multi_tanent.tenant.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PayslipTemplateRequest {
    @NotBlank(message = "Template name is required.")
    private String name;

    @NotBlank(message = "Template content cannot be empty.")
    private String templateContent; // The HTML content

    private Boolean isDefault;
}