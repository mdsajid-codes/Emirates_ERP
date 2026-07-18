package com.example.multi_tanent.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ToolParameterRequest {

    @NotBlank(message = "Parameter name is required.")
    private String name;

    @Valid
    private List<ToolParameterValueRequest> values;
}