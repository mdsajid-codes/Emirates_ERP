package com.example.multi_tanent.ats.dto;

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
public class AtsStateRequest {

    @NotNull(message = "Country ID is required")
    private Long countryId;

    @NotBlank(message = "State name is required")
    @Size(max = 100, message = "State name must be under 100 characters")
    private String name;

    @Size(max = 10, message = "State code must be under 10 characters")
    private String stateCode;
}
