package com.example.multi_tanent.tenant.base.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocumentTypeRequest {
    @NotBlank(message = "Document type name cannot be blank.")
    private String name;
}