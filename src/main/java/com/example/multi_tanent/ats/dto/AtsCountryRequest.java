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
public class AtsCountryRequest {

    @NotBlank(message = "Country name is required")
    @Size(max = 100, message = "Country name must be under 100 characters")
    private String name;

    @Size(max = 10, message = "ISO code must be under 10 characters")
    private String isoCode;
}
