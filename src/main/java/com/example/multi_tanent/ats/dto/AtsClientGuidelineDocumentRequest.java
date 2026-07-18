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
public class AtsClientGuidelineDocumentRequest {

    private String documentSource;

    @NotBlank(message = "Document title is required")
    private String documentTitle;

    private String description;

    private String fileName;

    private String filePath;

    private Long fileSize;

    private String mimeType;
}
