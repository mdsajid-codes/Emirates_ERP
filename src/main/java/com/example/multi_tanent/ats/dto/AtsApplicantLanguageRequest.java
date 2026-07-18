package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsApplicantLanguageRequest {

    @NotBlank(message = "Language name is required")
    private String languageName;

    @Builder.Default
    private Boolean canRead = false;

    @Builder.Default
    private Boolean canSpeak = false;

    @Builder.Default
    private Boolean canWrite = false;
}
