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
public class AtsActionRequest {

    @NotBlank(message = "Action name is required")
    @Size(max = 100, message = "Action name must be under 100 characters")
    private String name;

    @Size(max = 300, message = "Description must be under 300 characters")
    private String description;

    @Builder.Default
    private Boolean isActive = true;
}
