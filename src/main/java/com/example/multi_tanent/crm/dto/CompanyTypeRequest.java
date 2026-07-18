package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyTypeRequest {

    @NotBlank(message = "Company type name is required.")
    private String name;

    private Long locationId; // Optional
}