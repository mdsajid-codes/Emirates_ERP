package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsDocumentTypeRequest {

    @NotBlank(message = "Document type name is required")
    @Size(max = 100, message = "Document type name must be under 100 characters")
    private String name;
}
