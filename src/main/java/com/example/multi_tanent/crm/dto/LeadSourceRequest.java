package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeadSourceRequest {
    @NotBlank(message = "Lead source name is required.")
    private String name;
}