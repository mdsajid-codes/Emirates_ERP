package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientDocumentResponse {
    private Long id;
    private Long clientId;
    private String title;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private Long documentTypeId;
    private String documentTypeName;
    private String description;
    private Long uploadedById;
    private String uploadedByName;
}
