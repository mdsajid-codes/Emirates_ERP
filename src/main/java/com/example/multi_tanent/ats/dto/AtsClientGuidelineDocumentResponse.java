package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientGuidelineDocumentResponse {
    private Long id;
    private Long guidelineId;
    private String documentSource;
    private String documentTitle;
    private String description;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
