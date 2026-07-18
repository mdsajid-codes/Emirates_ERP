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
public class AtsBusinessUnitRequest {

    @NotBlank(message = "Business Unit name is required")
    @Size(max = 150, message = "Business Unit name must be under 150 characters")
    private String name;

    @Size(max = 50, message = "Business Unit code must be under 50 characters")
    private String code;

    @Size(max = 500, message = "Description must be under 500 characters")
    private String description;

    @Builder.Default
    private Boolean isActive = true;
}
