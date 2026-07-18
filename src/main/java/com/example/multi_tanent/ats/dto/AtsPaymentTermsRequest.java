package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsPaymentTermsRequest {

    @NotBlank(message = "Payment term name is required")
    @Size(max = 100, message = "Name must be under 100 characters")
    private String name;

    @Size(max = 300, message = "Description must be under 300 characters")
    private String description;

    @NotNull(message = "Payment terms days is required")
    @Min(value = 0, message = "Days must be 0 or greater")
    private Integer days;

    @Builder.Default
    private Boolean isActive = true;
}
