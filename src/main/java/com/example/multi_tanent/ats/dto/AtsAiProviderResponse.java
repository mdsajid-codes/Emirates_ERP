package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.AiProviderType;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class AtsAiProviderResponse {
    private Long id;
    private String providerName;
    private AiProviderType providerType;
    private String apiKeyMasked; // e.g., sk-...xxxx
    private String model;
    private String baseUrl;
    private Integer maxTokens;
    private Double temperature;
    private Boolean isActive;
    private Boolean isEnabled;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
