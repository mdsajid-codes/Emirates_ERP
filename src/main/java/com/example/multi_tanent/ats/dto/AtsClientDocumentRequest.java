package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientDocumentRequest {

    @NotBlank(message = "Document title is required")
    private String title;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File path is required")
    private String filePath;

    @NotNull(message = "Document type ID is required")
    private Long documentTypeId;

    private Long fileSize;
    
    private String mimeType;

    private String description;

    private Long uploadedById;
}
