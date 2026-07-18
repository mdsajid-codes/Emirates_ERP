package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.AiProviderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AtsAiProviderRequest {

    @NotBlank(message = "Provider name is required.")
    private String providerName;

    @NotNull(message = "Provider type is required.")
    private AiProviderType providerType;

    @NotBlank(message = "API Key is required.")
    private String apiKey;

    @NotBlank(message = "Model is required.")
    private String model;

    private String baseUrl;
    private Integer maxTokens;
    private Double temperature;
    private Boolean isEnabled;
    private String description;
}
