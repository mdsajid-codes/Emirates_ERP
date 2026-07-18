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
public class AtsDegreeRequest {

    @NotBlank(message = "Degree name is required")
    @Size(max = 100, message = "Degree name must be under 100 characters")
    private String name;
}
