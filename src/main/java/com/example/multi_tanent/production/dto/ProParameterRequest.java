package com.example.multi_tanent.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ProParameterRequest {
    @NotBlank(message = "Parameter name is required.")
    private String name;
    private boolean changesQuantity;
    private Long locationId; // Optional

    @Valid
    private List<ParameterValueRequest> values;

    @Data
    public static class ParameterValueRequest {
        @NotBlank(message = "Value code is required.") private String code;
        @NotBlank(message = "Value is required.") private String value;
    }
}